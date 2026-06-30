using System.Diagnostics;
using System.Text.Json.Nodes;
using ArcaneLibs.Collections;
using ArcaneLibs.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.DataMappings.Generic;
using Spacebar.Interop.Authentication;
using Spacebar.Models.Api;
using Spacebar.Models.Generic;

namespace Spacebar.UApi.Controllers;

[Route("/api/v{_}/auth/register")]
[Route("/api/auth/register")]
[ApiController]
public class RegisterController(ILogger<RegisterController> logger, SpacebarDbContext db, SpacebarAuthenticationService authService) : ControllerBase {
    private static ExpiringSemaphoreCache<RegisterResponse> _sem = new();

    [HttpPost]
    public async Task<RegisterResponse> GetMemberAsync(RegisterRequest req) {
        Task<RegisterResponse> task;

        lock (_sem)
            task = _sem.GetOrAdd($"{req.Email}{req.DateOfBirth}{req.Username}", async () => {
                    var sw = Stopwatch.StartNew();

                    // TODO: reg tokens - do we even want to continue supporting referrer-based tokens?
                    // TODO: config: register.allowNewRegistration

                    if (!req.Consent)
                        throw new SpacebarApiException("Consent is required to continue") {
                            Code = 0, Request = Request.Path, Errors = new() {
                                {
                                    "consent",
                                    new JsonObject() {
                                        { "code", "CONSENT_REQUIRED" },
                                        { "message", "You must consent to register on this instance." }
                                    }
                                }
                            }
                        };

                    // TODO: config reg.disabled
                    // TODO: captchas
                    // TODO: do we even want to support multiaccounts on a single email?
                    // TODO: ip checks
                    // TODO: gift_code_sku_id?
                    // TODO: check password strength
                    // TODO: ability to config DoB checks
                    if (!req.DateOfBirth.HasValue || (DateTime.UtcNow - req.DateOfBirth.Value.ToDateTime(new TimeOnly(0, 0, 0))).TotalDays < (13 * 365))
                        throw new SpacebarApiException("Invalid date of birth") {
                            Code = 0, Request = Request.Path, Errors = new() {
                                {
                                    "date_of_birth",
                                    new JsonObject() {
                                        { "code", "DATE_OF_BIRTH_INVALID" },
                                        { "message", "You must enter a valid date of birth to continue" }
                                    }
                                }
                            }
                        };

                    // TODO: password min length config, optional password
                    if (string.IsNullOrWhiteSpace(req.Password) || req.Password!.Length < 4)
                        throw new SpacebarApiException("Invalid password") {
                            Code = 0, Request = Request.Path, Errors = new() {
                                {
                                    "password",
                                    new JsonObject() {
                                        { "code", "PASSWORD_REQUIREMENTS_MIN_LENGTH" },
                                        { "message", "Your password must be at least 4 characters." }
                                    }
                                }
                            }
                        };

                    // TODO: require invite
                    // TODO: global register ratelimit
                    // TODO: configurable username length limits
                    if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Length < 4 || req.Username.Length > 255)
                        throw new SpacebarApiException("Invalid username length") {
                            Code = 0, Request = Request.Path, Errors = new() {
                                {
                                    "username",
                                    new JsonObject() {
                                        { "code", "BASE_TYPE_BAD_LENGTH" },
                                        { "message", "Username must be between 4 and 255 characters." }
                                    }
                                }
                            }
                        };

                    var existingDiscrims = await db.Users.Where(x => x.Username == req.Username).ToListAsync();
                    // TODO: throw error if out of slots
                    string newDiscrim;
                    do {
                        newDiscrim = Random.Shared.Next(0, 1000).ToString("0000");
                    } while (existingDiscrims.Any(x => x.Discriminator == newDiscrim));

                    var user = db.Users.Add(new() {
                        Username = req.Username,
                        Discriminator = newDiscrim,
                        Email = req.Email,
                        Id = GenerateSnowflake(),
                        Data = new JsonObject() {
                            { "hash", BCrypt.Net.BCrypt.HashPassword(req.Password, 12) },
                            { "valid_tokens_since", DateTime.Now }
                        }.ToJson(),
                        // settings?
                        Premium = true,
                        PremiumSince = DateTime.Now,
                        PremiumType = 2,
                        Verified = true,
                        CreatedAt = DateTime.Now,
                        Bot = false,
                        Fingerprints = new(),
                        Bio = ""
                    });

                    await db.SaveChangesAsync();
                    // TODO: verification email
                    // TODO: autojoin
                    // TODO: handle invite key

                    return new RegisterResponse() {
                        Token = await authService.GenerateAccessTokenAsync(user.Entity.Id)
                    };
                },
                TimeSpan.FromMinutes(1));
        return await task;
    }

    // TODO: move
    private static long _snowflakeIdx = 0;

    public static long GenerateSnowflake() {
        _snowflakeIdx %= 4095;
        return
            ((DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - new DateTimeOffset(2015, 1, 1, 0, 0, 0, TimeSpan.Zero).ToUnixTimeMilliseconds()) << 22)
            | ((long)(Environment.CurrentManagedThreadId % 31) << 17) //worker ID
            | ((long)(Environment.ProcessId % 31) << 12)              // process ID
            | ((long)_snowflakeIdx++)
            ;
    }
}