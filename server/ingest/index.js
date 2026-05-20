import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../config/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.create(userData);
  },
);

//ingest Function to deleteuser from database
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

//ingest Function to updateuser from database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  },
);

//ingest function to cnacel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [{ event: "app/checkpayment" }],
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);
    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);
      if (!booking) return;
      //if payment not made release seats and delete booking

      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  },
);

//inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: [{ event: "app/show.booked" }],
  },

  async ({ event, step }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");
    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Hi ${booking.user.name},</h2>
  <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
  <p>
    <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" })}<br/>
    <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu" })}
  </p>
  <p>Enjoy the show! 🍿</p>
  <p>Thanks for booking with us!<br/>- QuickShow Team</p>
</div>`,
    });
  },
);

// inngest function to send reminders
const sendShowReminders = inngest.createFunction(
  {
    id: "send-show-reminders",
    triggers: [{ cron: "0 */8 * * *" }],
  },

  async ({ step }) => {
    const now = new Date();
    const in8hrs = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8hrs.getTime() - 10 * 60 * 1000);

    // Prepare reminder tasks
    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: { $gte: windowStart, $lte: in8hrs },
      }).populate("movie");

      const tasks = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        const userIds = [...new Set(Object.values(show.occupiedSeats))];

        if (userIds.length === 0) continue;

        const users = await User.find({
          _id: { $in: userIds },
        }).select("name email");

        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }

      return tasks;
    });

    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send" };
    }

    // Send emails
    const results = await step.run("send-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: Your movie "${task.movieTitle}" starts soon`,
            body: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Hi ${task.userName},</h2>

                <p>
                  Your booking for 
                  <strong style="color: #F84565;">
                    "${task.movieTitle}"
                  </strong>
                </p>

                <p>
                  <strong>Date:</strong> 
                  ${new Date(task.showTime).toLocaleDateString("en-US", {
                    timeZone: "Asia/Kathmandu",
                  })}
                  <br/>

                  <strong>Time:</strong> 
                  ${new Date(task.showTime).toLocaleTimeString("en-US", {
                    timeZone: "Asia/Kathmandu",
                  })}
                </p>

                <p>
                  It starts in approx <strong>8 hours</strong>.
                </p>

                <p>Enjoy the show 🍿</p>
              </div>
            `,
          }),
        ),
      );
    });

    const sent = results.filter((r) => r.status === "fullfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} remainder(s) ${failed} failed.`,
    };
  },
);

const sendNewShowNotifications = inngest.createFunction(
  {
    id: "send-new-show-notification",
    triggers: [{ event: "app/show.added" }],
  },
  async ({ event }) => {
    const { movieTitle} = event.data;
    const users=await User.find({})
    for(const user of users){
      const userEmail=user.email,
      const userName=user.name
      const subject=`<div style="font-family:Arial,sans-serif; padding:20px;">
      <h2>Hi ${userName},</h2>
      <p>We have just added a new show to our library:</p>
      <h3 style="color:#F84565;">"${movieTitle}"</h3>
      <p>Visit our Website</p>
      <br/>
      <p>Thanks,<br/>QuickShow Team</p>
      </div>`;

      await sendEmail({to:userEmail,
      subject,
      body,  
    })
    }
    return {message:'Notification sent'}
  
  },
);
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications
];
