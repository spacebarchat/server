# Welcome to Fosscord Contributing Guide


This document aims to get you started with contributing to this repo! 

Please note that currently our Rendered documentation is out of date. It is accurate for the master branch as of writing but its not always accurate for Staging.



# 1. Who can contribute to Fosscord?

Everyone is welcome to contribute code to [Fosscord GitHub Organisation Projects](https://github.com/fosscord), 
provided that they are willing to license their contributions under the 
same license as the project itself. We follow a simple 'inbound=outbound' model 
for contributions: the act of submitting an 'inbound' contribution means that the 
contributor agrees to license the code under the same terms as the project's overall 'outbound'
license - in our case, this is almost always GNU Affero General Public License v3.0 (see
[LICENSE](https://github.com/fosscord/fosscord-server/blob/master/COPYING)).

# 2. What do I need?

Fosscord Server is written in TypeScript and requires [a NodeJS version of 14 or above](https://nodejs.org/en/download/).

The source code for Fosscord Server is hosted on GitHub. You will also need a Git client. Like for example Git CLI or Git Kraken or the one built into VSCode for example. Gitkraken is liked by project members that have access to it via Student Package or pay for it them selfs.

To build Fosscord Server you will need Python 3 due to dependencies needing it. A currently supported version of Python 3 is required 
as issues that cant be replicated using non EOL Python versions will be closed.


# 3. Get the source.

The preferred and easiest way to contribute changes is to fork the relevant
project on GitHub, and then [create a pull request](https://help.github.com/articles/using-pull-requests/) 
to ask us to pull your changes into our repo.

Please base your changes on the `staging` branch.

```sh
git clone git@github.com:YOUR_GITHUB_USER_NAME/fosscord-server.git
git checkout staging
```

If you need help getting started with git, this is beyond the scope of the document, but you
can find many good git tutorials on the web.

# 4. Install the OS Dependent Dependencies

## Under Linux

You need to install `gcc` and `g++`. Packaged with `build-essential` on Debian/Ubuntu and `base-devel` on Arch


## Under Windows

[Visual Studio](https://visualstudio.microsoft.com/) with the C++ package. 

# 5. Get in touch.

Join our developer community on Discord: https://discord.gg/zS5sjnCkSG

# 8. Test, test, test!
<a name="test-test-test"></a>

While you're developing and before submitting a patch, you'll
want to test your code.

## Create Database Migrations for your code.

CHANGE ME

# 9. Submit your patch.

Once you're happy with your patch, it's time to prepare a Pull Request.

To prepare a Pull Request, please:

1. Verify that you have tested your code sufficiently.
2. [sign off](#sign-off) your contribution;
3. `git push` your commit to your fork of Fosscord Server;
4. on GitHub, [create the Pull Request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request);
6. if you need to update your PR, please avoid rebasing and just add new commits to your branch.

## Sign off

In order to have a concrete record that your contribution is intentional
and you agree to license it under the same terms as the project's license, we've adopted the
same lightweight approach that the Linux Kernel
[submitting patches process](
https://www.kernel.org/doc/html/latest/process/submitting-patches.html#sign-your-work-the-developer-s-certificate-of-origin>),
[Docker](https://github.com/docker/docker/blob/master/CONTRIBUTING.md), and many other
projects use: the DCO (Developer Certificate of Origin:
http://developercertificate.org/). This is a simple declaration that you wrote
the contribution or otherwise have the right to contribute it to Fosscord:

```
Developer Certificate of Origin
Version 1.1
Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
660 York Street, Suite 102,
San Francisco, CA 94110 USA
Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.
Developer's Certificate of Origin 1.1
By making a contribution to this project, I certify that:
(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or
(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or
(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.
(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

If you agree to this for your contribution, then all that's needed is to
include the line in your commit or pull request comment:

```
Signed-off-by: Your Name <your@email.example.org>
```

We accept contributions under a legally identifiable name, such as
your name on government documentation or common-law names (names
claimed by legitimate usage or repute). 

We also accept contributions where Sign-Off is done privately with the Fosscord Organisation.
For this alternative Path please contact the Staff on the Discord.

Git allows you to add this signoff automatically when using the `-s`
flag to `git commit`, which uses the name and email set in your
`user.name` and `user.email` git configs.


# 10. Turn feedback into better code.

Once the Pull Request is opened, you will see a few things:

One or more of the developers will take a look at your Pull Request and offer feedback.

From this point, you should:

1. If a developer has requested changes, make these changes and let us know if it is ready for a developer to review again.
2. Create a new commit with the changes.
   - Please do NOT overwrite the history. New commits make the reviewer's life easier.
   - Push this commits to your Pull Request.
3. Back to 1.

Once the developers are happy, the patch will be merged into Fosscord Server!

# 11. Find a new issue.

By now, you know the drill!

# Conclusion

That's it! If you followed this guide you should be well on your way to successfully being able to
develop and contribute to Fosscord. This Guide also can help you with getting your own instance
up and running since a lot of the requirements for developers are also requirements for real instances
only major exception would be that Devs often will use SQLite. And this is frowned upon in Production
due to SQLites major downsides.
