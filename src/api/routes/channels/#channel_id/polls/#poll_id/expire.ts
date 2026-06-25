/*
  Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
  Copyright (C) 2026 Spacebar and Spacebar Contributors

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/util/handlers/route";
import { Message } from "@spacebar/database";
import { DiscordApiErrors, emitEvent, MessageUpdateEvent, pendingPolls } from "@spacebar/util";
import { EmbedType, MessageReferenceType, MessageType, PollAnswerCount } from "@spacebar/schemas";
import { sendMessage } from "@spacebar/api/util";

const router: Router = Router({ mergeParams: true });

router.post("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
    const { poll_id, channel_id } = req.params as { [key: string]: string };

    const message = await Message.findOne({ where: { id: poll_id } });

    if (!message) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    if (!message.poll) {
        throw DiscordApiErrors.NON_POLL_MESSAGE_CANNOT_EXPIRE;
    }

    if (new Date() > new Date(message.poll.expiry)) {
        throw DiscordApiErrors.POLL_EXPIRED;
    }

    message.poll.expiry = new Date();

    await message.save();

    await emitEvent({
        channel_id,
        data: message.toJSON(),
        event: "MESSAGE_UPDATE",
    } satisfies MessageUpdateEvent);

    if (!message.poll.results) {
        return;
    }

    const allAnswerCounts = message.poll.results.answer_counts as unknown as (Omit<PollAnswerCount, "me_voted"> & { voters: string[] })[];

    const totalVotes = allAnswerCounts.map((a) => a.voters).length;
    const winningAnswerCounts = allAnswerCounts.filter((a) => (a.count * totalVotes) / 100);

    const pollResultsMessage = {
        type: MessageType.POLL_RESULT,
        channel_id: message.channel_id,
        author_id: message.author_id,
        message_reference: {
            type: MessageReferenceType.DEFAULT,
            message_id: message.id,
            channel_id: message.channel_id,
        },
        embeds: [
            {
                type: EmbedType.poll_result,
                id: message.id,
                fields: [
                    {
                        name: "poll_question_text",
                        value: message.poll.question.text!,
                    },
                    {
                        name: "total_votes",
                        value: totalVotes.toString(),
                    },
                ],
            },
        ],
    };

    if (winningAnswerCounts) {
        const winningAnswer = message.poll.answers.find((a) => a.answer_id === Number(winningAnswerCounts[0]?.id))!;

        if (winningAnswerCounts.length === 0) {
            pollResultsMessage.embeds[0].fields.push({
                name: "victor_answer_votes",
                value: "0",
            });
        } else if (winningAnswerCounts.length === 1) {
            pollResultsMessage.embeds[0].fields.push(
                {
                    name: "victor_answer_votes",
                    value: winningAnswerCounts[0].count.toString(),
                },
                {
                    name: "victor_answer_id",
                    value: winningAnswerCounts[0].id,
                },
                {
                    name: "victor_answer_text",
                    value: winningAnswer.poll_media.text!,
                },
            );
        } else if (winningAnswerCounts.length > 1) {
            pollResultsMessage.embeds[0].fields.push({
                name: "victor_answer_votes",
                value: winningAnswerCounts[0].count.toString(),
            });
        }

        if (winningAnswer?.poll_media.emoji) {
            pollResultsMessage.embeds[0].fields.push(
                {
                    name: "victor_answer_emoji_id",
                    value: winningAnswer.poll_media.emoji.id!.toString()!,
                },
                {
                    name: "victor_answer_emoji_name",
                    value: winningAnswer.poll_media.emoji.name!,
                },
                {
                    name: "victor_answer_emoji_animated",
                    value: `${winningAnswer.poll_media.emoji.animated}`,
                },
            );
        }
    }

    await sendMessage(pollResultsMessage);
    pendingPolls.delete(message.id);

    res.send(message);
});

export default router;
