import BlurCircle from "../components/BlurCircle";
import samirImg from "../assets/samir.jpg";

function AboutUs() {
  const team = [
    {
      name: "Samir Shretha",
      role: "Full Stack Developer",
      image: samirImg,
    },
  ];

  return (
    <div className="relative px-6 md:px-16 lg:px-40 xl:px-44 pt-40 pb-60 overflow-hidden">
      <BlurCircle top="100px" left="0px" />
      <BlurCircle bottom="100px" right="0px" />

      <h1 className="text-4xl font-semibold mb-4">
        About <span className="text-primary">Us</span>
      </h1>
      <p className="text-gray-400 max-w-2xl leading-relaxed">
        QuickShow is your go-to platform for booking movie tickets fast and
        easy. We bring you the latest now-playing movies, real-time seat
        selection, and a seamless checkout experience — all in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            To make movie-going effortless by connecting audiences with the best
            theaters and shows in their area with just a few clicks.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Real-time seat booking, trailer previews, personalized favorites,
            and instant booking confirmations delivered straight to your inbox.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Why Choose Us</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            No hidden fees, no complicated steps. Just pick your movie, choose
            your seats, and enjoy the show.
          </p>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-semibold mb-6">Meet the Team</h2>
        <div className="flex flex-wrap gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-primary/30"
              />
              <p className="font-medium">{member.name}</p>
              <p className="text-gray-400 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
