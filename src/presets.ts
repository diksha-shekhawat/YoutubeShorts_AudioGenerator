import { ScriptPreset, VoiceOption } from "./types";

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Kore",
    name: "Kore",
    gender: "female",
    description: "Clear, highly articulate, and energetic female voice. Ideal for quick technical tutorials and fast-paced guides.",
    avatarColor: "from-pink-500 to-rose-500"
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "male",
    description: "Warm, natural, confident and energetic male voice. Excellent for conversational explanations and sharing tips.",
    avatarColor: "from-amber-500 to-orange-500"
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "male",
    description: "Youthful, casual, and highly expressive male voice. Sounds like a close friend explaining something exciting.",
    avatarColor: "from-teal-500 to-cyan-500"
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "male",
    description: "Friendly, engaging, and steady male voice. Great for clear, deliberate breakdowns with balanced emphasis.",
    avatarColor: "from-indigo-500 to-blue-500"
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "male",
    description: "Deep, crisp, and high-impact male voice. Adds massive energy and authority to fast-paced shorts.",
    avatarColor: "from-purple-500 to-violet-500"
  }
];

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "dsa-bounds",
    title: "DSA Concept: Bounds & Floor/Ceil",
    category: "Coding & Placement",
    text: `Hey, stop scrolling! Let's learn one DSA concept and get one step closer to better placements.

Do you know the difference between Lower Bound, Upper Bound, Floor, and Ceil? Most students mix them up.

Let's use this sorted array: 2, 4, 4, 6, 8, 10. Our target is 5.

Lower Bound is the first element greater than or equal to the target. Here, that's 6.

Upper Bound is the first element strictly greater than the target. That's also 6.

Now let's change the target to 4.

The Lower Bound becomes the first 4, while the Upper Bound becomes 6. That's why duplicates matter!

Finally, Floor is the greatest element less than or equal to the target, which is 4. And Ceil is the smallest element greater than or equal to the target, which is 6.

Here's the trick to remember forever:
Floor goes down.
Ceil goes up.
Lower Bound means greater than or equal to.
Upper Bound means strictly greater than.

Save this Short, and follow for more DSA concepts in under a minute!`
  },
  {
    id: "tech-hack",
    title: "Vite HMR Explained Simply",
    category: "Web Development",
    text: `Ever wonder how your browser updates instantly without a full page refresh? 

It's all thanks to HMR—Hot Module Replacement! 

Instead of reloading the entire webpage and losing your current UI state, Vite surgically swaps out only the modified module. 

It starts with a WebSocket connection between the Vite dev server and your browser client. 

When you edit a file, Vite rebuilds only that file, compiles it as an ES module, and sends a hot update to the browser. 

The browser's HMR runtime then injects the new module seamlessly! 

Double-tap if you love fast dev servers, and subscribe for more clean web dev hacks!`
  },
  {
    id: "fact-space",
    title: "The Silent Cosmos",
    category: "Science Facts",
    text: `Think space is quiet? It's actually completely silent! 

But why? 

Sound waves are mechanical waves—meaning they need a medium, like air or water, to travel through. 

Since space is a vacuum with no atmosphere, there are no particles for sound to vibrate. 

So even if a giant star explodes in space, it happens in absolute, total silence. 

Astronauts communicate using radio waves instead, because electromagnetic waves don't need a medium to travel! 

Mind-blown? Hit subscribe for your daily dose of cosmic secrets!`
  }
];
