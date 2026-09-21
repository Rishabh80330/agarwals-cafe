import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Coffee,
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Utensils,
} from "lucide-react";
import api from "../services/api";

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      name: "Coffee",
      description: "Freshly brewed favourites",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Snacks",
      description: "Perfect bites for every mood",
      image:
        "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Beverages",
      description: "Refreshing drinks & coolers",
      image:
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Desserts",
      description: "Something sweet to finish",
      image:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
    },
  ];

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);

        const response = await api.get("/menu?featured=true");

        setFeaturedItems(response.data.menuItems || []);
      } catch (error) {
        console.error("Failed to fetch featured menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="bg-[#f8f4ed] text-[#2f211b]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[92vh] overflow-hidden bg-[#2f211b]">

        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2200&q=85"
          alt="Agarwal's Cafe"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#211810]/70" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#211810]/90 via-[#211810]/60 to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-6 pb-16 pt-32 sm:px-8 lg:px-12">

          <div className="max-w-3xl text-white">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
              <Coffee size={15} />
              Agarwal&apos;s Cafe
            </div>

            <h1 className="font-serif text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Your everyday
              <span className="block text-[#d4a373]">
                coffee story.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#e7ddd4] sm:text-lg">
              A warm place for great coffee, delicious bites and
              conversations that stay with you.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d4a373] px-7 py-4 text-sm font-semibold text-[#2f211b] transition hover:bg-[#e4b986]"
              >
                Explore Our Menu
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Visit Us
                <MapPin size={17} />
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          INTRO / STORY
      ====================================================== */}

      <section className="px-6 py-24 sm:px-8 lg:px-12">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a56b3f]">
              Our Story
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-tight text-[#2f211b] sm:text-6xl">
              More than just
              <span className="block text-[#b87948]">
                a cup of coffee.
              </span>
            </h2>

            <p className="mt-7 text-base leading-8 text-[#756961]">
              Agarwal&apos;s Cafe is created as a comfortable place
              where people can slow down, enjoy good food and spend
              meaningful time together.
            </p>

            <p className="mt-5 text-base leading-8 text-[#756961]">
              From your first morning coffee to an evening snack with
              friends, every visit is meant to feel simple, warm and
              memorable.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]"
            >
              Come say hello
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="relative">

            <div className="overflow-hidden rounded-[2rem]">

              <img
                src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85"
                alt="Cafe interior"
                className="h-[520px] w-full object-cover"
              />

            </div>

            <div className="absolute -bottom-6 -left-4 rounded-3xl bg-[#2f211b] p-6 text-white shadow-xl sm:-left-8">

              <div className="flex items-center gap-3">
                <Heart
                  size={20}
                  className="text-[#d4a373]"
                />

                <div>
                  <p className="font-serif text-xl">
                    Made with care
                  </p>

                  <p className="mt-1 text-xs text-[#cfc2b7]">
                    Every cup. Every visit.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          HIGHLIGHTS
      ====================================================== */}

      <section className="bg-[#2f211b] px-6 py-20 text-white sm:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

              <Coffee
                size={28}
                className="text-[#d4a373]"
              />

              <h3 className="mt-6 font-serif text-2xl">
                Freshly Brewed
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#cfc2b7]">
                Comforting coffee made to be enjoyed one sip at a
                time.
              </p>

            </div>


            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

              <Utensils
                size={28}
                className="text-[#d4a373]"
              />

              <h3 className="mt-6 font-serif text-2xl">
                Something Delicious
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#cfc2b7]">
                Snacks, beverages and sweet treats for every mood.
              </p>

            </div>


            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

              <Sparkles
                size={28}
                className="text-[#d4a373]"
              />

              <h3 className="mt-6 font-serif text-2xl">
                Your Kind of Place
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#cfc2b7]">
                A relaxed café atmosphere made for friends, family
                and everyday moments.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section className="px-6 py-24 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a56b3f]">
                Explore
              </p>

              <h2 className="mt-3 font-serif text-5xl text-[#2f211b]">
                Something for every mood.
              </h2>

            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b5e3c]"
            >
              View Full Menu
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) => (
              <Link
                key={category.name}
                to="/menu"
                className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_40px_rgba(47,33,27,0.07)]"
              >

                <div className="relative h-72 overflow-hidden">

                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 text-white">

                    <h3 className="font-serif text-2xl">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs text-white/75">
                      {category.description}
                    </p>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          FEATURED MENU
      ====================================================== */}

      <section className="bg-[#eee6dc] px-6 py-24 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a56b3f]">
              From Our Menu
            </p>

            <h2 className="mt-3 font-serif text-5xl text-[#2f211b]">
              Customer favourites.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#756961]">
              A few things worth trying on your next visit.
            </p>

          </div>


          {loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-[1.75rem] bg-white"
                >
                  <div className="h-72 bg-[#ded4c8]" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded bg-[#ded4c8]" />
                    <div className="h-4 w-full rounded bg-[#ded4c8]" />
                    <div className="h-4 w-1/2 rounded bg-[#ded4c8]" />
                  </div>
                </div>
              ))}

            </div>
          ) : featuredItems.length > 0 ? (

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {featuredItems.slice(0, 3).map((item) => (

                <div
                  key={item._id}
                  className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_40px_rgba(47,33,27,0.07)]"
                >

                  <div className="relative h-72 overflow-hidden">

                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80"
                      }
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-[#2f211b] px-3 py-1.5 text-xs font-semibold text-white">
                      Popular
                    </div>

                  </div>


                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <h3 className="font-serif text-2xl text-[#2f211b]">
                        {item.name}
                      </h3>

                      <span className="shrink-0 rounded-full bg-[#f4e6d5] px-3 py-1 text-sm font-semibold text-[#8b5e3c]">
                        ₹{item.price}
                      </span>

                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#756961]">
                      {item.description}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="mt-12 rounded-3xl bg-white p-10 text-center">

              <Coffee
                size={30}
                className="mx-auto text-[#a56b3f]"
              />

              <p className="mt-4 text-sm text-[#756961]">
                Our featured menu is being prepared.
              </p>

            </div>

          )}


          <div className="mt-10 text-center">

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f211b] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4a3328]"
            >
              Explore Full Menu
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>
      </section>


      {/* =====================================================
          EXPERIENCE
      ====================================================== */}

      <section className="px-6 py-24 sm:px-8 lg:px-12">

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">

          <div className="overflow-hidden rounded-[2rem]">

            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85"
              alt="Cafe experience"
              className="h-full min-h-[500px] w-full object-cover"
            />

          </div>


          <div className="flex flex-col justify-center rounded-[2rem] bg-[#d4a373] p-8 sm:p-12 lg:p-16">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5d402c]">
              The Cafe Experience
            </p>

            <h2 className="mt-4 font-serif text-5xl leading-tight text-[#2f211b]">
              Stay a little longer.
            </h2>

            <p className="mt-6 text-base leading-8 text-[#5d4838]">
              Sometimes the best part of going out is not rushing
              back. Sit down, order something you love and enjoy the
              moment.
            </p>

            <div className="mt-8 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f211b] text-white">
                <Coffee size={19} />
              </div>

              <p className="text-sm font-semibold text-[#2f211b]">
                Your table is waiting.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          QUOTE
      ====================================================== */}

      <section className="px-6 pb-24 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-5xl text-center">

          <p className="font-serif text-4xl leading-tight text-[#2f211b] sm:text-5xl lg:text-6xl">
            &quot;Good coffee, good food and good people make
            ordinary days feel special.&quot;
          </p>

          <div className="mx-auto mt-7 h-px w-16 bg-[#c78b55]" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a56b3f]">
            Agarwal&apos;s Cafe
          </p>

        </div>

      </section>


      {/* =====================================================
          ORDER CTA
      ====================================================== */}

      <section className="px-6 pb-24 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#c78b55]">

          <div className="relative px-7 py-14 text-center sm:px-12 sm:py-16">

            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-black/5" />

            <div className="relative">

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5d402c]">
                Your Table Is Waiting
              </p>

              <h2 className="mt-4 font-serif text-5xl text-[#2f211b] sm:text-6xl">
                Come hungry.
                <span className="block">
                  Leave happy.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5d4838]">
                Discover your next favourite coffee, snack or sweet
                treat at Agarwal&apos;s Cafe.
              </p>

              <Link
                to="/menu"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#211810] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#392820]"
              >
                Order from our menu
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTACT SECTION — LAST SECTION ON HOME
      ====================================================== */}

      <section className="bg-[#f8f4ed] px-6 pb-24 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-7xl">

          <div className="overflow-hidden rounded-[2rem] bg-[#2f211b] text-white">

            <div className="grid lg:grid-cols-2">

              {/* LEFT */}

              <div className="p-8 sm:p-12 lg:p-16">

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4a373]">
                  Get In Touch
                </p>

                <h2 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
                  Come visit
                  <span className="block text-[#d4a373]">
                    Agarwal&apos;s Cafe.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#d9cec3] sm:text-base">
                  Have a question, want to know more about our menu,
                  or simply want to say hello? We&apos;d love to hear
                  from you.
                </p>

                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d4a373] px-7 py-4 text-sm font-semibold text-[#2f211b] transition hover:bg-[#e2b987]"
                >
                  Contact Us
                  <ArrowRight size={17} />
                </Link>

              </div>


              {/* RIGHT */}

              <div className="border-t border-white/10 bg-[#392820] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">

                <div className="space-y-7">

                  {/* ADDRESS */}

                  <a
                    href="https://maps.app.goo.gl/uVx5BaqkEDDRbzsC7?g_st=aw"
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                      <MapPin size={19} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Visit Us
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#cfc2b7]">
                        Jhumra, Near SBI Bank,
                        <br />
                        Hazaribagh, Jharkhand
                      </p>

                    </div>

                  </a>


                  {/* PHONE */}

                  <a
                    href="tel:6200495244"
                    className="flex gap-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                      <Phone size={19} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Call Us
                      </p>

                      <p className="mt-1 text-sm text-[#cfc2b7]">
                        6200495244
                      </p>

                    </div>

                  </a>


                  {/* EMAIL */}

                  <a
                    href="mailto:rishabhagrawal4915@gmail.com"
                    className="flex gap-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold">
                        Email Us
                      </p>

                      <p className="mt-1 break-all text-sm text-[#cfc2b7]">
                        rishabhagrawal4915@gmail.com
                      </p>

                    </div>

                  </a>


                  {/* HOURS */}

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c78b55]">
                      <Clock size={19} />
                    </div>

                    <div>

                      <p className="font-semibold">
                        Opening Hours
                      </p>

                      <p className="mt-1 text-sm text-[#cfc2b7]">
                        Every Day · 10:00 AM – 10:00 PM
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;