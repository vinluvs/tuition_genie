"use client";

import React, { useEffect, useRef } from "react";
import "./hero-effects.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Heart } from "lucide-react";

// File path: /app/(marketing)/page.tsx  (Next.js 13 app router)

// Simple animated "deep-space creature" using a deforming sphere
function DeepSpaceCreature({ speed = 1.2 }: { speed?: number }) {
  const mesh = useRef<any>(null);
  const geo = useRef<any>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.15;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.1;

    // subtle breathing
    const s = 1 + 0.06 * Math.sin(t * speed);
    mesh.current.scale.set(s, s, s);

    // vertex wobble (cheap, CPU-light)
    if (geo.current) {
      const pos = geo.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const vy = pos.array[ix + 1];
        pos.array[ix + 2] = pos.array[ix + 2] + Math.sin(t + i) * 0.0006; // tiny wobble
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <sphereGeometry ref={geo} args={[1.4, 64, 64]} />
      <meshStandardMaterial
        metalness={0.7}
        roughness={0.15}
        emissive={'#6ee7b7'}
        emissiveIntensity={0.3}
        color={'#0f172a'}
        envMapIntensity={0.6}
      />
    </mesh>
  );
}

export default function Page() {
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = parallaxRef.current;
      if (!el) return;
      const scrolled = window.scrollY;
      // set transform for parallax layers
      const layers = el.querySelectorAll<HTMLElement>("[data-parallax]");
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallax) || 0;
        const movement = -(scrolled * depth) / 10;
        layer.style.transform = `translateY(${movement}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-[#071021] to-black text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12" ref={parallaxRef}>
        {/* NAV (small) */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold">TG</div>
            <div className="font-medium tracking-wide">Tuition Genie</div>
          </div>
          <div className="hidden md:flex gap-6 items-center text-sm text-slate-300">
            <a className="hover:underline" href="#testimonials">Features & Testimonials</a>
            <a className="hover:underline" href="#contact">Contact</a>
            <Button className="ml-2" variant={"default" as any}>
              <a href="/login">Login</a>
           </Button>
          </div>
        </nav>

        {/* HERO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[60vh]">
          <div className="space-y-6" data-parallax="8">
            <motion.h1
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight hero-h1-bg"
            >
              Tuition Genie — Your all-in-one tuition management 
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6 }}
              className="text-slate-300 max-w-xl"
            >
              Manage classes, fees, student progress and magical schedules with one elegant dashboard. Dark, premium UI inspired by deep-space creatures — slightly eerie, very efficient.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex gap-4"
            >
              <Button asChild>
                <a href="/signup" className="flex items-center gap-2">Get Started <span className="sr-only">Get Started</span></a>
              </Button>
              <Button variant={"ghost" as any} asChild>
                <a href="#contact" className="flex items-center gap-2"><Mail size={16} /> Request Demo</a>
              </Button>
            </motion.div>

            <div className="hero-stats">
              <Card >
                <CardContent className="flex items-center gap-3">
                  <div className="text-xs text-slate-400">Trusted by</div>
                  <div className="text-sm font-medium">300+ tutors</div>
                </CardContent>
              </Card>

              <Card >
                <CardContent className="flex items-center gap-3">
                  <div className="text-xs text-slate-400">Avg. rating</div>
                  <div className="text-sm font-medium">4.8 <Heart size={14} /></div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3D Canvas / Image */}
          <div className="w-full h-96 md:h-[420px] rounded-2xl overflow-hidden relative bg-linear-to-b from-[#020617] to-[#071021]" data-parallax="5">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={1} />
              <DeepSpaceCreature />
              <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
              <Html fullscreen>
                {/* subtle overlay label inside canvas */}
                <div className="pointer-events-none absolute bottom-6 right-6 text-xs text-slate-400 pr-4">Live preview</div>
              </Html>
            </Canvas>
            {/* decorative parallax stars */}
            <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* FEATURES / TESTIMONIALS */}
        <section id="testimonials" className="mt-10 space-y-10">
          <h2 className="text-2xl font-bold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 10, opacity: 0 }} className="bg-slate-900/40 rounded-xl p-6">
              <h3 className="font-semibold">Smart Management</h3>
              <p className="text-slate-400 text-sm mt-2">Effortlessly organize classes and students with intuitive tools designed to save you time and boost productivity.</p>
            </motion.div>

            <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 20, opacity: 0 }} className="bg-slate-900/40 rounded-xl p-6">
              <h3 className="font-semibold">Fees & Invoicing</h3>
              <p className="text-slate-400 text-sm mt-2">Automate fee collection, reminders, and revenue tracking—so you never miss a payment and always stay organized.</p>
            </motion.div>

            <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 30, opacity: 0 }} className="bg-slate-900/40 rounded-xl p-6">
              <h3 className="font-semibold">Progress Tracking</h3>
              <p className="text-slate-400 text-sm mt-2">Showcase student growth with beautiful analytics and reports that impress parents and help you teach smarter.</p>
            </motion.div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold">What tutors say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                { name: "Ms. Aisha", note: "Better than any spreadsheet. Time saved = sanity.", role: "Math Tutor, Delhi" },
                { name: "Ravi Sir", note: "Students love the progress graphs. Fees are easier to manage.", role: "Physics, Jaipur" },
                { name: "Neha Ma'am", note: "Sleek. Fast. My admin tasks halved.", role: "Chemistry, Pune" },
              ].map((t, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-linear-to-br from-[#051026] to-[#071022] p-5 rounded-xl border border-slate-800">
                  <div className="text-slate-200 font-semibold">{t.name}</div>
                  <div className="text-slate-400 text-sm mt-2">"{t.note}"</div>
                  <div className="text-xs text-slate-500 mt-3">{t.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="mt-16 flex flex-col md:flex-row gap-8 items-center">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <h2 className="text-2xl font-bold">Talk to Tuition Genie</h2>
            <p className="text-slate-400">Book a demo or ask for onboarding help. We'll handle the mundane—so you can teach.</p>

            <form className="mt-4 grid grid-cols-1 gap-3">
              <input className="bg-slate-900/40 rounded-md p-3 placeholder:text-slate-500" placeholder="Your name" />
              <input className="bg-slate-900/40 rounded-md p-3 placeholder:text-slate-500" placeholder="Email" />
              <textarea className="bg-slate-900/40 rounded-md p-3 placeholder:text-slate-500" placeholder="Message" rows={4} />
              <div className="flex gap-3">
                <Button type="submit">Send Message</Button>
                <Button variant={"outline" as any}>Request Callback</Button>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <Card className="p-6 bg-linear-to-br from-[#021022] to-[#051026] border border-slate-800">
              <CardContent>
                <div className="text-sm text-slate-300">Need immediate help?</div>
                <div className="text-xl font-semibold mt-2">support@tuitiongenie.com</div>
                <div className="text-xs text-slate-500 mt-3">We reply within 24–48 hours on business days.</div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-800 pt-8 pb-16 text-slate-400 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-black font-bold">TG</div>
              <div>© {new Date().getFullYear()} Tuition Genie</div>
            </div>

            <div className="flex gap-6">
              <a className="hover:underline">Privacy</a>
              <a className="hover:underline">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

