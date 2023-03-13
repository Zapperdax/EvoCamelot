const { Events } = require("discord.js");
const cron = require("cron");
const User = require("../Model/userModel");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Logged In As ${client.user.tag}`);

    const channel = client.channels.cache.get("813262057331884032");
    if (!channel) {
      console.log("No Channel Found");
      return;
    }
    const job0 = new cron.CronJob(
      "0 0 4 * * SUN",
      async () => {
        const nonDonatedUsers = await User.find({ donated: false });
        if (nonDonatedUsers.length > 0) {
          let pingTheseUsers = "";
          nonDonatedUsers.map((user) => {
            pingTheseUsers += `${"<@" + user.id + ">" + " "}`;
          });
          channel.send(
            "List Of Users Who Didn't Donate This Week -> " + pingTheseUsers
          );
          User.updateMany({}, { amount: 0, donated: false }, (err) => {
            if (err) {
              console.error(err);
              return;
            }

            channel.send(
              `Weekly Donations Have Been Resetted, You Guys Can Start Donating For This Week Now ${"<@&740824003932848199>"}`
            );
          });
        }
      },
      null,
      true,
      "Europe/London"
    );
    job0.start();
  },
};
