import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

const CONTACT_DETAILS = {
  address: "Jhumra, Near SBI Bank, Hazaribagh, Jharkhand",
  phone: "6200495244",
  email: "rishabhagrawal4915@gmail.com",
  hours: "10:00 AM – 10:00 PM",
  whatsapp: "916200495244",
  mapUrl: "https://maps.app.goo.gl/uVx5BaqkEDDRbzsC7?g_st=aw",
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });

      if (response.data.success) {
        setSuccess(
          "Thank you! Your message has been sent successfully."
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      }
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#2f211b]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#2f211b]">

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c78b55]/20" />

        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#c78b55]/10" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">

          <div className="max-w-3xl">

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-[#d4a373]">
              Get In Touch
            </p>

            <h1 className="font-serif text-5xl leading-[1.05] text-[#fffaf3] sm:text-6xl lg:text-7xl">
              We would love to
              <span className="block text-[#d4a373]">
                hear from you.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#d9cec3] sm:text-lg">
              Have a question, feedback, or simply want to say hello?
              Reach out to Agarwal&apos;s Cafe. We&apos;re always happy
              to hear from our customers.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          CONTACT INFORMATION CARDS
      ====================================================== */}

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* ADDRESS */}

          <a
            href={CONTACT_DETAILS.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl bg-white p-7 shadow-[0_15px_50px_rgba(47,33,27,0.08)] transition duration-300 hover:-translate-y-1"
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e6d5] text-[#8b5e3c]">
              <MapPin size={22} />
            </div>

            <h3 className="font-serif text-xl">
              Visit Us
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#756961]">
              {CONTACT_DETAILS.address}
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]">
              Open Location
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>

          </a>


          {/* PHONE */}

          <a
            href={`tel:${CONTACT_DETAILS.phone}`}
            className="group rounded-3xl bg-white p-7 shadow-[0_15px_50px_rgba(47,33,27,0.08)] transition duration-300 hover:-translate-y-1"
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e6d5] text-[#8b5e3c]">
              <Phone size={22} />
            </div>

            <h3 className="font-serif text-xl">
              Call Us
            </h3>

            <p className="mt-3 text-sm text-[#756961]">
              {CONTACT_DETAILS.phone}
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]">
              Call Now
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>

          </a>


          {/* EMAIL */}

          <a
            href={`mailto:${CONTACT_DETAILS.email}`}
            className="group rounded-3xl bg-white p-7 shadow-[0_15px_50px_rgba(47,33,27,0.08)] transition duration-300 hover:-translate-y-1"
          >

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e6d5] text-[#8b5e3c]">
              <Mail size={22} />
            </div>

            <h3 className="font-serif text-xl">
              Email Us
            </h3>

            <p className="mt-3 break-words text-sm leading-6 text-[#756961]">
              {CONTACT_DETAILS.email}
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]">
              Send Email
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>

          </a>


          {/* HOURS */}

          <div className="rounded-3xl bg-white p-7 shadow-[0_15px_50px_rgba(47,33,27,0.08)]">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e6d5] text-[#8b5e3c]">
              <Clock size={22} />
            </div>

            <h3 className="font-serif text-xl">
              Opening Hours
            </h3>

            <p className="mt-3 text-sm text-[#756961]">
              Every Day
            </p>

            <p className="mt-1 text-sm font-semibold text-[#2f211b]">
              {CONTACT_DETAILS.hours}
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          FORM + CONTACT INFORMATION
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:px-12">

        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_70px_rgba(47,33,27,0.08)] lg:grid-cols-2">

          {/* ================= FORM ================= */}

          <div className="p-7 sm:p-10 lg:p-14">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a56b3f]">
              Send a Message
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#2f211b] sm:text-5xl">
              Let&apos;s talk.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#756961]">
              Whether it&apos;s feedback, a question, or just a
              friendly hello, drop us a message and we&apos;ll get
              back to you.
            </p>


            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">

                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <span>{success}</span>

              </div>
            )}


            {/* ERROR MESSAGE */}

            {error && (
              <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* NAME + PHONE */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#44352e]">
                    Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-[#e6ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none transition focus:border-[#a56b3f] focus:ring-2 focus:ring-[#a56b3f]/10"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-[#44352e]">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    className="w-full rounded-2xl border border-[#e6ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none transition focus:border-[#a56b3f] focus:ring-2 focus:ring-[#a56b3f]/10"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#44352e]">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#e6ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none transition focus:border-[#a56b3f] focus:ring-2 focus:ring-[#a56b3f]/10"
                />

              </div>


              {/* MESSAGE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#44352e]">
                  Message *
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-2xl border border-[#e6ddd3] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none transition focus:border-[#a56b3f] focus:ring-2 focus:ring-[#a56b3f]/10"
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f211b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#4a3328] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >

                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send size={17} />
                  </>
                )}

              </button>

            </form>

          </div>


          {/* ================= INFO PANEL ================= */}

          <div className="bg-[#2f211b] p-7 text-white sm:p-10 lg:p-14">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4a373]">
              Come Visit Us
            </p>

            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
              We&apos;re here for you.
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#d9cec3]">
              Whether you want to enjoy a cup of coffee, grab a quick
              bite, or simply spend some good time with your people,
              Agarwal&apos;s Cafe is always ready to welcome you.
            </p>


            <div className="mt-10 space-y-6">

              {/* ADDRESS */}

              <a
                href={CONTACT_DETAILS.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex gap-4 rounded-2xl border border-white/10 p-5 transition hover:bg-white/5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                  <MapPin size={20} />
                </div>

                <div>

                  <p className="font-semibold">
                    Visit Us
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#cfc2b7]">
                    {CONTACT_DETAILS.address}
                  </p>

                  <span className="mt-2 inline-block text-xs font-semibold text-[#d4a373]">
                    Open location →
                  </span>

                </div>

              </a>


              {/* PHONE */}

              <a
                href={`tel:${CONTACT_DETAILS.phone}`}
                className="flex gap-4 rounded-2xl border border-white/10 p-5 transition hover:bg-white/5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                  <Phone size={20} />
                </div>

                <div>

                  <p className="font-semibold">
                    Call Us
                  </p>

                  <p className="mt-1 text-sm text-[#cfc2b7]">
                    {CONTACT_DETAILS.phone}
                  </p>

                </div>

              </a>


              {/* EMAIL */}

              <a
                href={`mailto:${CONTACT_DETAILS.email}`}
                className="flex gap-4 rounded-2xl border border-white/10 p-5 transition hover:bg-white/5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                  <Mail size={20} />
                </div>

                <div className="min-w-0">

                  <p className="font-semibold">
                    Email Us
                  </p>

                  <p className="mt-1 break-all text-sm text-[#cfc2b7]">
                    {CONTACT_DETAILS.email}
                  </p>

                </div>

              </a>


              {/* HOURS */}

              <div className="flex gap-4 rounded-2xl border border-white/10 p-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                  <Clock size={20} />
                </div>

                <div>

                  <p className="font-semibold">
                    Opening Hours
                  </p>

                  <p className="mt-1 text-sm text-[#cfc2b7]">
                    Every Day
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#d4a373]">
                    {CONTACT_DETAILS.hours}
                  </p>

                </div>

              </div>

            </div>


            {/* WHATSAPP */}

            <a
              href={`https://wa.me/${CONTACT_DETAILS.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-[#c78b55] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#b87843]"
            >
              <MessageCircle size={19} />
              Chat with us on WhatsApp
            </a>

          </div>

        </div>
      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="border-t border-[#e4d9ce] bg-[#f8f4ed] py-16">

        <div className="mx-auto max-w-7xl px-6 text-center sm:px-8 lg:px-12">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a56b3f]">
            Agarwal&apos;s Cafe
          </p>

          <h2 className="mt-3 font-serif text-4xl text-[#2f211b] sm:text-5xl">
            Good coffee. Good food. Good conversations.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#756961]">
            Come visit us at Jhumra, Hazaribagh or explore our menu
            online.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2f211b] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#4a3328]"
            >
              Explore Our Menu
              <ArrowRight size={17} />
            </Link>

            <a
              href={`tel:${CONTACT_DETAILS.phone}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d8c9bb] bg-white px-7 py-4 text-sm font-semibold text-[#2f211b] transition hover:bg-[#f2ebe3]"
            >
              <Phone size={17} />
              Call Us
            </a>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Contact;