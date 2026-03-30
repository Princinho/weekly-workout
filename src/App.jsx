import { useState } from "react";

const DAYS = [
  {
    id: 1,
    label: "MONDAY",
    sublabel: "Upper 1",
    accent: "#F5C518",
    muscles: ["Shoulders 35%", "Back 24%", "Chest 24%"],
    exercises: [
      {
        name: "Flat Dumbbell Press",
        equipment: "2×10kg · bench or floor",
        sets: 4, reps: "8–12",
        how: "Lie flat on your bench (or floor). Hold a dumbbell in each hand at chest level, elbows at ~45° from your body. Press both up until arms are nearly straight, then lower slowly back to chest.",
        gotchas: [
          "Don't flare elbows out to 90° — that stresses the shoulder joint",
          "Lower until you feel a stretch in the chest, not just halfway",
          "Keep your feet flat on the floor, don't arch aggressively",
        ],
      },
      {
        name: "Seated Dumbbell Shoulder Press",
        equipment: "2×10kg · bench",
        sets: 3, reps: "8–12",
        how: "Sit upright on the bench. Hold a dumbbell in each hand at ear level, palms facing forward. Press both overhead until arms are nearly straight, then lower back to ear height.",
        gotchas: [
          "Don't lean back excessively — keep your torso upright",
          "Stop just short of locking elbows at the top to keep tension",
          "Don't let the dumbbells drift forward — they should stay in line with your ears",
        ],
      },
      {
        name: "Chest-Supported Dumbbell Row",
        equipment: "2×10kg · bench",
        sets: 4, reps: "8–12",
        how: "Lie face-down on the flat bench, chest resting on it, legs straddling the sides. Let both dumbbells hang straight down. Row them up toward your hips by squeezing your shoulder blades together, then lower slowly.",
        gotchas: [
          "Pull toward your hips, not your armpits — that hits the mid-back better",
          "Don't shrug your shoulders — keep them packed down",
          "Control the descent; don't just drop the weight",
        ],
      },
      {
        name: "Lean-In Lateral Raise",
        equipment: "1×10kg",
        sets: 3, reps: "10–20 per side",
        how: "Stand next to a wall or hold a sturdy upright (like the barbell standing vertically). Lean away from it, holding one dumbbell in your free hand. Raise that arm out to the side to shoulder height, pause, lower slowly.",
        gotchas: [
          "Lead with your elbow, not your wrist",
          "Only raise to shoulder height — going higher recruits traps instead of delts",
          "The lean lets you get a better range of motion than a standard lateral raise",
        ],
      },
      {
        name: "Dumbbell Overhead Tricep Extension",
        equipment: "1×10kg",
        sets: 3, reps: "10–15",
        how: "Sit or stand. Hold one dumbbell with both hands, gripping it vertically. Raise it overhead. Keeping upper arms locked vertical, bend elbows to lower the dumbbell behind your head, then press back up.",
        gotchas: [
          "Upper arms must stay still — only your forearms move",
          "Don't let your elbows flare out wide",
          "Keep your core braced — don't arch your lower back as you press up",
        ],
      },
    ],
  },
  {
    id: 2,
    label: "TUESDAY",
    sublabel: "Lower 1 — Quad Focused",
    accent: "#3BAFDA",
    muscles: ["Quadriceps 40%", "Calves 20%"],
    exercises: [
      {
        name: "Bulgarian Split Squat — Quad Focus",
        equipment: "2×10kg · bench",
        sets: 3, reps: "8–12 per side",
        how: "Stand about 2 feet in front of the bench. Place your rear foot on top of it (laces down). Hold a dumbbell in each hand. Lower your back knee toward the floor by bending your front knee directly over your toes. Press through the front heel to stand back up.",
        gotchas: [
          "Front foot position is key — if your knee travels past your toes, step forward more",
          "For quad focus: stay more upright with your torso",
          "Start without weight to find the right stance before adding dumbbells",
          "Go slow on the descent — this is very demanding on balance",
        ],
      },
      {
        name: "Dumbbell Romanian Deadlift",
        equipment: "2×10kg",
        sets: 3, reps: "10–15",
        how: "Stand with feet hip-width. Hold a dumbbell in each hand in front of your thighs. Push your hips back (hinge, don't squat), letting the dumbbells slide down your legs until you feel a strong hamstring stretch — usually around mid-shin. Drive hips forward to stand back up.",
        gotchas: [
          "This is a HIP HINGE, not a squat — knees have only a slight bend",
          "Keep your back flat throughout — the moment it rounds, you've gone too far",
          "The dumbbells should stay close to your legs the whole way down",
          "Feel the stretch in the back of your thighs, not your lower back",
        ],
      },
      {
        name: "Heel-Elevated Goblet Squat",
        equipment: "1×10kg",
        sets: 3, reps: "10–15",
        how: "Place your heels on a small elevation — a book, a weight plate, or a folded towel. Hold one dumbbell vertically at your chest with both hands. Squat down as deep as comfortable, keeping your torso upright. Drive through your whole foot to stand.",
        gotchas: [
          "The heel elevation lets you sit deeper and keeps the torso more upright — don't skip it",
          "Knees should track over your toes — push them out",
          "Don't let the dumbbell pull you forward; keep elbows up",
        ],
      },
      {
        name: "Single-Leg Weighted Calf Raise",
        equipment: "1×10kg",
        sets: 3, reps: "8–12 per side",
        how: "Stand on one foot on the edge of a step (or flat ground). Hold one dumbbell in the same-side hand. Lower your heel as far as possible, then rise up onto the ball of your foot as high as possible. Use the other hand to lightly touch a wall for balance only.",
        gotchas: [
          "Full range of motion matters here — deep stretch at the bottom, maximum rise at the top",
          "Don't bounce — pause briefly at the bottom stretch",
          "If a step isn't available, flat ground works, just less range of motion",
        ],
      },
      {
        name: "Dead Bug",
        equipment: "Bodyweight",
        sets: 5, reps: "10 reps",
        how: "Lie on your back, arms pointing straight up at the ceiling, knees bent at 90° in the air (like a table-top). Slowly lower your right arm behind your head AND your left leg toward the floor simultaneously — without letting your lower back lift off the floor. Bring them back, then switch sides.",
        gotchas: [
          "Your lower back MUST stay pressed into the floor at all times — this is the whole point",
          "Move slowly and with control — speed defeats the purpose",
          "Breathe out as you extend the limbs",
          "If your back lifts, reduce how far you extend",
        ],
      },
    ],
  },
  {
    id: 3,
    label: "THURSDAY",
    sublabel: "Upper 2",
    accent: "#E8533F",
    muscles: ["Back 38%", "Chest 25%", "Shoulders 19%"],
    exercises: [
      {
        name: "Barbell Floor Press",
        equipment: "30kg bar · floor",
        sets: 4, reps: "8–12",
        how: "Lie on your back on the floor. Hold the barbell with hands slightly wider than shoulder-width. Start with arms extended. Lower the bar until your upper arms (triceps) rest on the floor, pause for a beat, then press back up. (Substitutes the low incline dumbbell press — no incline needed.)",
        gotchas: [
          "The floor limits your range of motion — that's fine, it's intentional here",
          "Pause when triceps touch the floor — don't bounce",
          "Keep your wrists straight and stacked over your elbows",
          "Tuck elbows at roughly 45° from your body",
        ],
      },
      {
        name: "3-Point Dumbbell Row",
        equipment: "1×10kg · bench",
        sets: 4, reps: "8–12 per side",
        how: "Place one hand and the same-side knee on the bench for support. Your back should be flat and parallel to the floor. Hold the dumbbell in the other hand, letting it hang. Row it up toward your hip — elbow goes past your back. Lower slowly.",
        gotchas: [
          "Pull toward your HIP, not your shoulder — this is the most common mistake",
          "Don't rotate your torso to get the weight up — keep hips and shoulders square",
          "At the top, squeeze the shoulder blade toward your spine",
          "Your supporting arm is there to stabilize, not to push",
        ],
      },
      {
        name: "Dumbbell Lateral Raises",
        equipment: "2×10kg",
        sets: 3, reps: "10–20",
        how: "Stand with a dumbbell in each hand at your sides. With a slight bend in your elbows, raise both arms out to the sides until they reach shoulder height. Lower slowly — aim for 3 seconds on the way down.",
        gotchas: [
          "Slow descent is where the gains are — don't just drop them",
          "Slightly tilt the dumbbell so the front edge is a bit lower (like pouring water) — better delt activation",
          "Don't shrug — keep shoulders packed down the whole time",
          "10kg will be heavy here; reduce range of motion if needed rather than swinging",
        ],
      },
      {
        name: "Standing Overhead Tricep Extension",
        equipment: "1×10kg",
        sets: 3, reps: "10–15",
        how: "Stand upright. Hold one dumbbell with both hands overhead (grip the top weight plate). Upper arms stay glued vertically next to your head. Bend elbows to lower the dumbbell behind your head, then press back up. (Substitutes the incline version — works the tricep long head equally well standing.)",
        gotchas: [
          "Upper arms must not move — only the forearms hinge",
          "Don't let elbows flare out to the sides",
          "Brace your core — the standing position makes it tempting to arch the back",
        ],
      },
      {
        name: "Prone Arm Circles",
        equipment: "2×10kg · bench or floor",
        sets: 3, reps: "10–15",
        how: "Lie face-down on the bench (or floor). Hold a dumbbell in each hand, arms hanging down. Move both arms in slow, controlled circles — forward for a set, then backward. Keep the movement small and deliberate.",
        gotchas: [
          "This is a shoulder health / rotator cuff exercise — don't go heavy or fast",
          "Keep your neck neutral — don't crane your head up",
          "Small circles are better than big sloppy ones",
          "If 10kg is too heavy, use no weight or just 1 dumbbell at a time",
        ],
      },
    ],
  },
  {
    id: 4,
    label: "FRIDAY",
    sublabel: "Lower 2 — Glute Focused",
    accent: "#4CAF79",
    muscles: ["Glutes 44%", "Abs 19%", "Calves 19%"],
    exercises: [
      {
        name: "Bulgarian Split Squat — Glute Focus",
        equipment: "2×10kg · bench",
        sets: 4, reps: "8–12 per side",
        how: "Same setup as Tuesday — rear foot on bench, dumbbell in each hand. The difference: lean your torso slightly forward and take a wider step forward. This shifts the load from quads to glutes. Lower your back knee toward the floor, then drive up.",
        gotchas: [
          "The forward lean is intentional here — don't fight it",
          "Press through your front heel (not toes) to maximize glute activation",
          "Wider stance than the quad version — experiment to find what you feel in your glutes",
          "Same balance warning as Monday — go slow",
        ],
      },
      {
        name: "Single-Leg Hip Thrust",
        equipment: "1×10kg · bench",
        sets: 3, reps: "10–20 per side",
        how: "Sit on the floor with your upper back against the bench edge. Place one dumbbell on your hip (hold it with both hands). Plant one foot on the floor, extend the other leg straight out. Drive your planted heel into the floor to raise your hips until your body forms a straight line from knee to shoulder. Squeeze glutes at the top. Lower slowly.",
        gotchas: [
          "The bench should be at mid-upper back, not neck level",
          "Squeeze the glute of the working leg hard at the top — pause for 1 second",
          "Don't hyperextend your lower back at the top — hips level, not sky-high",
          "Chin tucked slightly — don't crane your neck back",
        ],
      },
      {
        name: "Single-Leg Weighted Calf Raise",
        equipment: "1×10kg",
        sets: 3, reps: "8–12 per side",
        how: "Same as Tuesday — stand on one foot, hold one dumbbell same side. Full range: deep stretch at the bottom, max rise at the top. Light touch on a wall for balance only.",
        gotchas: [
          "Same as Tuesday: no bouncing, full range of motion",
          "If your calves are sore from Tuesday, reduce the weight and focus on stretch",
        ],
      },
      {
        name: "Bodyweight Sliding Hamstring Curl",
        equipment: "Bodyweight · slippery surface",
        sets: 3, reps: "10–20",
        how: "Lie on your back. Place both heels on a smooth floor in socks (or a folded towel). Lift your hips up into a bridge. From there, slowly slide both heels away from you until legs are extended, then curl them back in. Keep hips up the whole time.",
        gotchas: [
          "This is HARD — if you can't do it, start with both legs and lower the hips first",
          "The sliding out (eccentric) is the most important part — go slow there",
          "Tiles or wood floors in socks work best; carpet is too grippy",
          "Don't let your hips drop as you slide — maintain the bridge",
        ],
      },
      {
        name: "Reverse Crunches",
        equipment: "Bodyweight · bench or floor",
        sets: 3, reps: "10–20",
        how: "Lie on your back on the bench or floor. Hold the sides of the bench (or floor) above your head for stability. Keep knees bent at ~90°. Use your lower abs to curl your knees toward your chest, lifting your hips off the surface. Lower slowly back down.",
        gotchas: [
          "The movement is in your HIPS, not your legs — don't just swing your knees",
          "Control the descent — lowering slowly doubles the work",
          "Don't use momentum — no rocking or swinging",
          "Keep your neck relaxed and on the bench/floor",
        ],
      },
    ],
  },
];

export default function BWS() {
  const [activeDay, setActiveDay] = useState(0);
  const [completed, setCompleted] = useState({});
  const [expanded, setExpanded] = useState({});

  const day = DAYS[activeDay];

  const toggleSet = (ei, si) => {
    const k = `${activeDay}-${ei}-${si}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };
  const isSetDone = (ei, si) => !!completed[`${activeDay}-${ei}-${si}`];
  const toggleExpand = (ei) => setExpanded(p => ({ ...p, [`${activeDay}-${ei}`]: !p[`${activeDay}-${ei}`] }));
  const isExpanded = (ei) => !!expanded[`${activeDay}-${ei}`];

  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = day.exercises.reduce((s, e, ei) =>
    s + Array.from({ length: e.sets }, (_, si) => isSetDone(ei, si) ? 1 : 0).reduce((a,b)=>a+b,0), 0);
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f4ef",
      fontFamily: "'Syne', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inconsolata:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #ccc; }
        .day-tab { cursor: pointer; transition: all 0.18s ease; border: none; }
        .day-tab:hover { transform: translateY(-1px); }
        .set-btn { cursor: pointer; transition: all 0.12s; border: none; }
        .set-btn:hover { transform: scale(1.12); }
        .ex-card { transition: box-shadow 0.2s; }
        .ex-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .expand-btn { cursor: pointer; border: none; background: none; transition: all 0.15s; }
        .expand-btn:hover { opacity: 0.7; }
        .gotcha-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 7px; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .detail-panel { animation: slideDown 0.18s ease; }
        @keyframes grow { from { width: 0 } to { width: var(--w) } }
        .prog-bar { animation: grow 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#1a1a1a",
        padding: "28px 20px 24px",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "clamp(22px,5vw,32px)", color: "#fff", letterSpacing: "-0.02em" }}>
                Built With Science
              </div>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.12em", marginTop: 2, fontFamily: "'Inconsolata', monospace" }}>
                BEGINNER PROGRAM · ADAPTED FOR HOME GYM
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: day.accent, fontFamily: "'Inconsolata', monospace" }}>
                {pct}%
              </div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "'Inconsolata', monospace" }}>
                {doneSets}/{totalSets} sets done
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 14, height: 3, background: "#2e2e2e", borderRadius: 2, overflow: "hidden" }}>
            <div className="prog-bar" key={`${activeDay}-${doneSets}`} style={{
              height: "100%", background: day.accent, borderRadius: 2, "--w": `${pct}%`
            }} />
          </div>

          {/* Day tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
            {DAYS.map((d, i) => (
              <button key={d.id} className="day-tab" onClick={() => setActiveDay(i)} style={{
                padding: "8px 14px",
                background: activeDay === i ? d.accent : "#2a2a2a",
                color: activeDay === i ? "#1a1a1a" : "#888",
                borderRadius: 6,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session header */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            fontWeight: 800, fontSize: "clamp(26px,6vw,40px)",
            color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1,
          }}>
            {day.sublabel}
          </div>
          <div style={{
            height: 3, flex: 1, minWidth: 40,
            background: day.accent, borderRadius: 2, marginBottom: 6,
          }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {day.muscles.map(m => (
            <span key={m} style={{
              fontSize: 10, padding: "3px 10px",
              background: day.accent + "22",
              color: day.accent,
              borderRadius: 20,
              fontFamily: "'Inconsolata', monospace",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px 60px" }}>
        {day.exercises.map((ex, ei) => {
          const allDone = Array.from({ length: ex.sets }, (_, si) => isSetDone(ei, si)).every(Boolean);
          const open = isExpanded(ei);
          return (
            <div key={ei} className="ex-card" style={{
              background: "#fff",
              borderRadius: 10,
              marginBottom: 10,
              overflow: "hidden",
              border: `1px solid ${allDone ? day.accent + "55" : "#e8e4dd"}`,
              opacity: allDone ? 0.65 : 1,
            }}>
              {/* Top row */}
              <div style={{ padding: "14px 16px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {allDone && <span style={{ fontSize: 13, color: day.accent }}>✓</span>}
                    <span style={{
                      fontWeight: 700, fontSize: 15, color: "#1a1a1a",
                      textDecoration: allDone ? "line-through" : "none",
                      letterSpacing: "-0.01em",
                    }}>{ex.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{
                      fontSize: 10, fontFamily: "'Inconsolata', monospace",
                      background: "#f0ede8", color: "#666", padding: "2px 8px", borderRadius: 4,
                    }}>{ex.equipment}</span>
                    <span style={{ fontSize: 11, color: "#999", fontFamily: "'Inconsolata', monospace" }}>
                      {ex.sets} sets · {ex.reps} reps
                    </span>
                  </div>
                </div>

                {/* Set dots */}
                <div style={{ display: "flex", gap: 5, alignItems: "center", paddingTop: 2, flexShrink: 0 }}>
                  {Array.from({ length: ex.sets }, (_, si) => (
                    <button key={si} className="set-btn" onClick={() => toggleSet(ei, si)} style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isSetDone(ei, si) ? day.accent : "#f0ede8",
                      color: isSetDone(ei, si) ? "#1a1a1a" : "#aaa",
                      fontFamily: "'Inconsolata', monospace",
                      fontWeight: 600, fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSetDone(ei, si) ? "✓" : si + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expand button */}
              <button className="expand-btn" onClick={() => toggleExpand(ei)} style={{
                width: "100%",
                padding: "7px 16px",
                background: "#faf8f5",
                borderTop: "1px solid #f0ede8",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#888",
                fontSize: 11,
                fontFamily: "'Inconsolata', monospace",
                letterSpacing: "0.08em",
                textAlign: "left",
              }}>
                <span style={{
                  display: "inline-block",
                  transform: open ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }}>▶</span>
                {open ? "HIDE INSTRUCTIONS" : "HOW TO DO IT + GOTCHAS"}
              </button>

              {/* Detail panel */}
              {open && (
                <div className="detail-panel" style={{
                  padding: "16px",
                  borderTop: "1px solid #f0ede8",
                  background: "#fdfcfa",
                }}>
                  {/* How to */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: 10, letterSpacing: "0.12em", color: day.accent,
                      fontFamily: "'Inconsolata', monospace", fontWeight: 600, marginBottom: 7,
                    }}>HOW TO DO IT</div>
                    <p style={{ fontSize: 13, color: "#444", lineHeight: 1.65, fontWeight: 400 }}>
                      {ex.how}
                    </p>
                  </div>

                  {/* Gotchas */}
                  <div>
                    <div style={{
                      fontSize: 10, letterSpacing: "0.12em", color: "#E8533F",
                      fontFamily: "'Inconsolata', monospace", fontWeight: 600, marginBottom: 7,
                    }}>⚠ WATCH OUT FOR</div>
                    {ex.gotchas.map((g, gi) => (
                      <div key={gi} className="gotcha-item">
                        <span style={{
                          flexShrink: 0, width: 18, height: 18,
                          background: "#fde8e5", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, color: "#E8533F", fontWeight: 700, marginTop: 1,
                        }}>!</span>
                        <span style={{ fontSize: 12.5, color: "#555", lineHeight: 1.55 }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom note */}
        <div style={{
          marginTop: 8, padding: "14px 16px",
          background: "#fff", borderRadius: 10,
          border: "1px solid #e8e4dd",
          fontSize: 11.5, color: "#888", lineHeight: 1.7,
          fontFamily: "'Inconsolata', monospace",
        }}>
          <span style={{ color: "#1a1a1a", fontWeight: 600 }}>Schedule:</span> Mon → Tue → rest Wed → Thu → Fri → rest weekend
          <br />
          <span style={{ color: "#1a1a1a", fontWeight: 600 }}>Warm-up:</span> 5–10 min before each session — jumping jacks, arm circles, bodyweight squats
          <br />
          <span style={{ color: "#1a1a1a", fontWeight: 600 }}>When 12 reps is easy:</span> slow the reps down (3s down, 1s pause) before worrying about weight
        </div>
      </div>
    </div>
  );
}