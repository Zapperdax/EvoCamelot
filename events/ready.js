const { Events } = require("discord.js");
const cron = require("cron");
const User = require("../Model/userModel");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Logged In As ${client.user.tag}`);
    client.user.setPresence({
      activity: {
        name: "Tracking Donations",
        type: "PLAYING",
      },
    });
    const channel = client.channels.cache.get("813262057331884032");
    if (!channel) {
      console.log("No Channel Found");
      return;
    }

    const job0 = new cron.CronJob(
      "0 0 4 * * SUN",
      async () => {
        await User.updateMany(
          { donated: false },
          { $inc: { extraWeeks: -1 } },
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
          }
        );

        const nonDonatedUsers = await User.find({ donated: false });
        if (nonDonatedUsers.length > 0) {
          let pingTheseUsers = "";
          nonDonatedUsers.map((user) => {
            pingTheseUsers += `${"<@" + user.id + ">" + " "}`;
          });
          channel.send(
            "List Of Users Who Didn't Donate This Week -> " + pingTheseUsers
          );
        }

        await User.updateMany(
          {},
          {
            $set: {
              amount: 0,
              donated: {
                $cond: {
                  if: { $lte: ["$extraWeeks", 0] },
                  then: false,
                  else: "$donated",
                },
              },
            },
          },
          (err) => {
            if (err) {
              console.error(err);
              return;
            }

            channel.send(
              `Weekly Donations Have Been Resetted, You Guys Can Start Donating For This Week Now ${"<@&740824003932848199>"}`
            );
          }
        );
      },
      null,
      true,
      "Europe/London"
    );
    const job1 = new cron.CronJob(
      "0 0 4 * * FRI",
      async () => {
        const nonDonatedUsers = await User.find({ donated: false });
        if (nonDonatedUsers.length > 0) {
          const promises = nonDonatedUsers.map(async (user) => {
            const userId = user.id;
            const userToDm = await client.users.fetch(userId);
            const dmChannel = await userToDm.createDM();
            return dmChannel.send(
              "Hi, I'm Here To Remind You Of Your Pending Weekly Donation In Evo's Lair ^^"
            );
          });
          Promise.all(promises)
            .then(() => {
              console.log("Reminders sent to non-donators.");
              channel.send(
                "Reminder Has Been Sent To Everyone Who Haven't Donated"
              );
            })
            .catch((err) => {
              console.error(err);
            });
        }
      },
      null,
      true,
      "Europe/London"
    );

    job0.start();
    job1.start();
  },
};
