import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.labExperiment.deleteMany();
  await prisma.aRPoster.deleteMany();
  await prisma.campusBuilding.deleteMany();
  await prisma.vRContent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.moduleResource.deleteMany();
  await prisma.module.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.course.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@arelms.com" },
    update: {},
    create: {
      email: "instructor@arelms.com",
      name: "Dr. Jane Smith",
      passwordHash,
      role: "INSTRUCTOR",
      bio: "Expert in Virtual Reality and Immersive Learning with over 10 years of experience in VR development and STEAM education.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@arelms.com" },
    update: {},
    create: {
      email: "student@arelms.com",
      name: "John Doe",
      passwordHash,
      role: "STUDENT",
      bio: "Passionate about learning VR and immersive technologies.",
    },
  });

  // ── Course 1: VR Fundamentals ──
  const course1 = await prisma.course.upsert({
    where: { id: "course-vr-fundamentals" },
    update: {},
    create: {
      id: "course-vr-fundamentals",
      title: "VR Fundamentals",
      description:
        "Learn the fundamentals of Virtual Reality development including 3D environments, spatial computing, and immersive interaction design.",
      instructorId: instructor.id,
      published: true,
      category: "Technology",
      difficulty: "Beginner",
      estimatedHours: 20,
    },
  });

  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course1.id, tag: "VR" } },
    update: {},
    create: { courseId: course1.id, tag: "VR" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course1.id, tag: "Beginners" } },
    update: {},
    create: { courseId: course1.id, tag: "Beginners" },
  });

  const c1m1 = await prisma.module.create({
    data: {
      title: "Introduction to VR",
      description: "Understanding the basics of Virtual Reality",
      order: 1,
      courseId: course1.id,
    },
  });

  const c1m2 = await prisma.module.create({
    data: {
      title: "Building VR Environments",
      description: "Creating immersive 3D environments",
      order: 2,
      courseId: course1.id,
    },
  });

  const c1l1 = await prisma.lesson.create({
    data: {
      title: "What is Virtual Reality?",
      description: "An overview of VR technology, its history, and its transformative applications across industries like gaming, healthcare, and education.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=qIcZlHFqzAQ",
      duration: 600,
      moduleId: c1m1.id,
    },
  });

  const c1l2 = await prisma.lesson.create({
    data: {
      title: "VR Hardware Overview",
      description: "A deep dive into VR headsets, controllers, tracking systems, and the hardware that powers immersive experiences.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=OKz7-OTD5So",
      duration: 900,
      moduleId: c1m1.id,
    },
  });

  const c1l3 = await prisma.lesson.create({
    data: {
      title: "Setting Up Your First VR Scene",
      description: "Step-by-step guide to creating your first VR scene using Unity, including lighting, physics, and basic interactions.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=nV_hd6bLXmw",
      duration: 1200,
      moduleId: c1m2.id,
    },
  });

  const c1l4 = await prisma.lesson.create({
    data: {
      title: "VR Design Principles",
      description: "Best practices for designing comfortable and engaging VR experiences, covering locomotion, UI, and accessibility.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=akFB5YYkcbo",
      duration: 450,
      moduleId: c1m2.id,
    },
  });

  // Questions for Course 1
  await prisma.question.createMany({
    data: [
      // c1l1 - What is Virtual Reality?
      {
        lessonId: c1l1.id,
        text: "What does VR stand for?",
        options: JSON.stringify(["Virtual Reality", "Visual Reality", "Virtual Recognition", "Visual Recognition"]),
        answer: "Virtual Reality",
        order: 1,
      },
      {
        lessonId: c1l1.id,
        text: "Which industry commonly uses VR technology?",
        options: JSON.stringify(["Gaming", "Healthcare", "Education", "All of the above"]),
        answer: "All of the above",
        order: 2,
      },
      {
        lessonId: c1l1.id,
        text: "Who is credited with coining the term 'Virtual Reality'?",
        options: JSON.stringify(["Jaron Lanier", "Mark Zuckerberg", "Steve Jobs", "Elon Musk"]),
        answer: "Jaron Lanier",
        order: 3,
      },
      {
        lessonId: c1l1.id,
        text: "What is the primary goal of VR?",
        options: JSON.stringify(["To create an immersive simulated environment", "To browse the web", "To edit documents", "To make phone calls"]),
        answer: "To create an immersive simulated environment",
        order: 4,
      },
      {
        lessonId: c1l1.id,
        text: "What does 'presence' mean in VR?",
        options: JSON.stringify(["Feeling of being inside the virtual world", "Being physically present", "Having a VR headset", "Internet connection"]),
        answer: "Feeling of being inside the virtual world",
        order: 5,
      },
      {
        lessonId: c1l1.id,
        text: "What is a common input device for VR?",
        options: JSON.stringify(["Motion controllers", "Keyboard", "Mouse", "Printer"]),
        answer: "Motion controllers",
        order: 6,
      },
      {
        lessonId: c1l1.id,
        text: "Which of the following is NOT a VR application?",
        options: JSON.stringify(["Spreadsheet editing", "Medical training", "Architectural visualization", "Virtual tourism"]),
        answer: "Spreadsheet editing",
        order: 7,
      },
      {
        lessonId: c1l1.id,
        text: "What is the difference between VR and AR?",
        options: JSON.stringify(["VR replaces reality, AR overlays on reality", "AR replaces reality, VR overlays on reality", "They are the same", "VR is for gaming only"]),
        answer: "VR replaces reality, AR overlays on reality",
        order: 8,
      },
      {
        lessonId: c1l1.id,
        text: "What is the minimum frame rate recommended for comfortable VR?",
        options: JSON.stringify(["90 FPS", "30 FPS", "60 FPS", "120 FPS"]),
        answer: "90 FPS",
        order: 9,
      },
      {
        lessonId: c1l1.id,
        text: "What technology enables VR headsets to track head movement?",
        options: JSON.stringify(["IMU sensors", "GPS", "Bluetooth", "WiFi"]),
        answer: "IMU sensors",
        order: 10,
      },
      // c1l2 - VR Hardware Overview
      {
        lessonId: c1l2.id,
        text: "Which of the following is a VR headset?",
        options: JSON.stringify(["Oculus Quest", "iPhone", "MacBook", "AirPods"]),
        answer: "Oculus Quest",
        order: 1,
      },
      {
        lessonId: c1l2.id,
        text: "What technology do most modern VR headsets use for position tracking?",
        options: JSON.stringify(["Inside-out tracking", "GPS tracking", "WiFi triangulation", "Bluetooth beacons"]),
        answer: "Inside-out tracking",
        order: 2,
      },
      {
        lessonId: c1l2.id,
        text: "What does IPD stand for?",
        options: JSON.stringify(["Interpupillary Distance", "Integrated Pixel Display", "Internal Processing Device", "Image Projection Depth"]),
        answer: "Interpupillary Distance",
        order: 3,
      },
      {
        lessonId: c1l2.id,
        text: "Which component displays images inside a VR headset?",
        options: JSON.stringify(["OLED or LCD panels", "Speakers", "Battery", "Microphone"]),
        answer: "OLED or LCD panels",
        order: 4,
      },
      {
        lessonId: c1l2.id,
        text: "What is the typical field of view for modern VR headsets?",
        options: JSON.stringify(["Around 90-110 degrees", "45 degrees", "180 degrees", "360 degrees"]),
        answer: "Around 90-110 degrees",
        order: 5,
      },
      {
        lessonId: c1l2.id,
        text: "What does 6DoF tracking allow?",
        options: JSON.stringify(["Movement in all three axes and rotation", "Only head rotation", "Only positional movement", "Finger tracking"]),
        answer: "Movement in all three axes and rotation",
        order: 6,
      },
      {
        lessonId: c1l2.id,
        text: "What is the purpose of fresnel lenses in VR?",
        options: JSON.stringify(["To focus the display for near-eye viewing", "To improve audio", "To reduce weight", "To track hand movements"]),
        answer: "To focus the display for near-eye viewing",
        order: 7,
      },
      {
        lessonId: c1l2.id,
        text: "Which company manufactures the Quest headset?",
        options: JSON.stringify(["Meta", "Apple", "Google", "Microsoft"]),
        answer: "Meta",
        order: 8,
      },
      {
        lessonId: c1l2.id,
        text: "What is 'passthrough' in VR headsets?",
        options: JSON.stringify(["Showing the real world through external cameras", "Passing through a doorway", "Data transfer", "Network connectivity"]),
        answer: "Showing the real world through external cameras",
        order: 9,
      },
      {
        lessonId: c1l2.id,
        text: "What does 'tetherless' mean for VR headsets?",
        options: JSON.stringify(["No cable connection to a PC", "No internet required", "No controllers needed", "No battery needed"]),
        answer: "No cable connection to a PC",
        order: 10,
      },
      // c1l3 - Setting Up Your First VR Scene
      {
        lessonId: c1l3.id,
        text: "What game engine is commonly used for VR development?",
        options: JSON.stringify(["Unity", "Photoshop", "Chrome", "Excel"]),
        answer: "Unity",
        order: 1,
      },
      {
        lessonId: c1l3.id,
        text: "What is a 'scene' in Unity?",
        options: JSON.stringify(["A container for game objects and environments", "A video file", "A script", "A texture"]),
        answer: "A container for game objects and environments",
        order: 2,
      },
      {
        lessonId: c1l3.id,
        text: "What component handles VR camera setup in Unity?",
        options: JSON.stringify(["XR Rig", "Main Camera", "Light", "Audio Listener"]),
        answer: "XR Rig",
        order: 3,
      },
      {
        lessonId: c1l3.id,
        text: "What does URP stand for?",
        options: JSON.stringify(["Universal Render Pipeline", "Ultra Resolution Pipeline", "Unity Rendering Protocol", "User Render Path"]),
        answer: "Universal Render Pipeline",
        order: 4,
      },
      {
        lessonId: c1l3.id,
        text: "What is 'baked lighting'?",
        options: JSON.stringify(["Pre-computed lighting stored in textures", "Real-time dynamic lighting", "Light from the sun", "Ambient light"]),
        answer: "Pre-computed lighting stored in textures",
        order: 5,
      },
      {
        lessonId: c1l3.id,
        text: "What is a 'collider' used for in VR?",
        options: JSON.stringify(["To detect physical interactions", "To display images", "To play sounds", "To connect to the internet"]),
        answer: "To detect physical interactions",
        order: 6,
      },
      {
        lessonId: c1l3.id,
        text: "What is the first step in setting up a VR project?",
        options: JSON.stringify(["Install XR Plugin Management", "Create a script", "Design a menu", "Build for Android"]),
        answer: "Install XR Plugin Management",
        order: 7,
      },
      {
        lessonId: c1l3.id,
        text: "What is teleportation used for in VR?",
        options: JSON.stringify(["To move the player without motion sickness", "To communicate with others", "To load new levels", "To reset the scene"]),
        answer: "To move the player without motion sickness",
        order: 8,
      },
      {
        lessonId: c1l3.id,
        text: "What is 'occlusion culling'?",
        options: JSON.stringify(["Hiding objects not visible to the camera", "Deleting unused assets", "Optimizing textures", "Removing audio"]),
        answer: "Hiding objects not visible to the camera",
        order: 9,
      },
      {
        lessonId: c1l3.id,
        text: "What is a 'skybox' in Unity?",
        options: JSON.stringify(["A 360-degree background for the scene", "A storage container", "A type of light", "A physics material"]),
        answer: "A 360-degree background for the scene",
        order: 10,
      },
      // c1l4 - VR Design Principles
      {
        lessonId: c1l4.id,
        text: "Why is comfort important in VR design?",
        options: JSON.stringify(["To prevent motion sickness", "To reduce cost", "To improve graphics", "To increase weight"]),
        answer: "To prevent motion sickness",
        order: 1,
      },
      {
        lessonId: c1l4.id,
        text: "What is 'locomotion' in VR?",
        options: JSON.stringify(["How users move through virtual space", "Voice communication", "Graphics rendering", "Audio playback"]),
        answer: "How users move through virtual space",
        order: 2,
      },
      {
        lessonId: c1l4.id,
        text: "What is 'vignetting' used for in VR?",
        options: JSON.stringify(["To reduce motion sickness during movement", "To enhance colors", "To improve resolution", "To track hands"]),
        answer: "To reduce motion sickness during movement",
        order: 3,
      },
      {
        lessonId: c1l4.id,
        text: "What is the recommended font size for VR text?",
        options: JSON.stringify(["At least 1 degree of visual angle", "8 pixels", "12 points", "Any size works"]),
        answer: "At least 1 degree of visual angle",
        order: 4,
      },
      {
        lessonId: c1l4.id,
        text: "Why is scale important in VR?",
        options: JSON.stringify(["To maintain realistic proportions", "To save memory", "To load faster", "To reduce file size"]),
        answer: "To maintain realistic proportions",
        order: 5,
      },
      {
        lessonId: c1l4.id,
        text: "What is 'audio spatialization'?",
        options: JSON.stringify(["3D audio that changes with head position", "Mono audio", "Stereo audio", "Music playback"]),
        answer: "3D audio that changes with head position",
        order: 6,
      },
      {
        lessonId: c1l4.id,
        text: "What is 'simulator sickness'?",
        options: JSON.stringify(["Discomfort from mismatched visual and vestibular cues", "A software bug", "Hardware failure", "Network lag"]),
        answer: "Discomfort from mismatched visual and vestibular cues",
        order: 7,
      },
      {
        lessonId: c1l4.id,
        text: "What is the 'law of inertia' in VR?",
        options: JSON.stringify(["Users expect objects to behave like in the real world", "Objects must be heavy", "Movement must be slow", "Interfaces must be simple"]),
        answer: "Users expect objects to behave like in the real world",
        order: 8,
      },
      {
        lessonId: c1l4.id,
        text: "What is 'accessibility' in VR design?",
        options: JSON.stringify(["Making VR usable for people with different abilities", "Making VR affordable", "Making VR wireless", "Making VR lightweight"]),
        answer: "Making VR usable for people with different abilities",
        order: 9,
      },
      {
        lessonId: c1l4.id,
        text: "What is the '10mm rule' in VR UI design?",
        options: JSON.stringify(["UI elements should be at least 10mm apart", "Fonts must be 10mm tall", "Buttons must be 10mm wide", "Menus at 10mm distance"]),
        answer: "UI elements should be at least 10mm apart",
        order: 10,
      },
    ],
  });

  // ── Course 2: 3D Modeling for VR ──
  const course2 = await prisma.course.upsert({
    where: { id: "course-3d-modeling" },
    update: {},
    create: {
      id: "course-3d-modeling",
      title: "3D Modeling for VR",
      description: "Master 3D modeling techniques optimized for Virtual Reality. Learn to create low-poly assets, optimise textures, and export for VR engines.",
      instructorId: instructor.id,
      published: true,
      category: "Design",
      difficulty: "Intermediate",
      estimatedHours: 30,
    },
  });

  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course2.id, tag: "3D" } },
    update: {},
    create: { courseId: course2.id, tag: "3D" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course2.id, tag: "Modeling" } },
    update: {},
    create: { courseId: course2.id, tag: "Modeling" },
  });

  const c2m1 = await prisma.module.create({
    data: {
      title: "Foundations of 3D Modeling",
      description: "Learn the core concepts of 3D modeling including vertices, edges, faces, and basic transformation tools.",
      order: 1,
      courseId: course2.id,
    },
  });

  const c2m2 = await prisma.module.create({
    data: {
      title: "Texturing and Materials",
      description: "Understand UV mapping, texture baking, and material creation for VR-optimized assets.",
      order: 2,
      courseId: course2.id,
    },
  });

  const c2l1 = await prisma.lesson.create({
    data: {
      title: "Introduction to Blender for VR",
      description: "Get started with Blender and learn the interface, navigation, and basic modeling tools for creating VR assets.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=SAcHh9_ZG6A",
      duration: 800,
      moduleId: c2m1.id,
    },
  });

  const c2l2 = await prisma.lesson.create({
    data: {
      title: "Low-Poly Modeling Techniques",
      description: "Learn low-poly modeling techniques that keep polygon counts low while maintaining visual quality for VR performance.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=-gbCSnkvwNo",
      duration: 1100,
      moduleId: c2m1.id,
    },
  });

  const c2l3 = await prisma.lesson.create({
    data: {
      title: "UV Mapping Fundamentals",
      description: "Understand UV mapping and how to properly unwrap 3D models for texturing.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=qa_1LjeWsJg",
      duration: 950,
      moduleId: c2m2.id,
    },
  });

  const c2l4 = await prisma.lesson.create({
    data: {
      title: "Creating PBR Materials",
      description: "Learn Physically Based Rendering (PBR) materials and how to create realistic surfaces for VR.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=DvbzqSQ28qs",
      duration: 700,
      moduleId: c2m2.id,
    },
  });

  await prisma.question.createMany({
    data: [
      // c2l1 - Introduction to Blender for VR
      {
        lessonId: c2l1.id,
        text: "What is Blender primarily used for?",
        options: JSON.stringify(["3D modeling", "Video editing", "Web development", "Spreadsheets"]),
        answer: "3D modeling",
        order: 1,
      },
      {
        lessonId: c2l1.id,
        text: "What is the default object in a new Blender scene?",
        options: JSON.stringify(["Cube", "Sphere", "Cylinder", "Plane"]),
        answer: "Cube",
        order: 2,
      },
      {
        lessonId: c2l1.id,
        text: "What key is used to rotate the 3D viewport?",
        options: JSON.stringify(["Middle mouse button", "Left mouse button", "Right mouse button", "Scroll wheel"]),
        answer: "Middle mouse button",
        order: 3,
      },
      {
        lessonId: c2l1.id,
        text: "What does Edit Mode allow you to do?",
        options: JSON.stringify(["Modify individual vertices, edges, and faces", "Change render settings", "Add animations", "Export models"]),
        answer: "Modify individual vertices, edges, and faces",
        order: 4,
      },
      {
        lessonId: c2l1.id,
        text: "What keyboard shortcut adds a new object in Blender?",
        options: JSON.stringify(["Shift + A", "Ctrl + N", "Alt + O", "Spacebar"]),
        answer: "Shift + A",
        order: 5,
      },
      {
        lessonId: c2l1.id,
        text: "What is the 3D cursor used for?",
        options: JSON.stringify(["To define where new objects are placed", "To select objects", "To paint textures", "To animate"]),
        answer: "To define where new objects are placed",
        order: 6,
      },
      {
        lessonId: c2l1.id,
        text: "What is a modifier in Blender?",
        options: JSON.stringify(["A non-destructive operation on geometry", "A type of texture", "A rendering engine", "A file format"]),
        answer: "A non-destructive operation on geometry",
        order: 7,
      },
      {
        lessonId: c2l1.id,
        text: "What file format is commonly used for 3D models in VR?",
        options: JSON.stringify(["FBX or glTF", "JPEG", "MP3", "DOCX"]),
        answer: "FBX or glTF",
        order: 8,
      },
      {
        lessonId: c2l1.id,
        text: "What is Object Mode in Blender?",
        options: JSON.stringify(["Mode for manipulating entire objects", "Mode for editing vertices", "Mode for rendering", "Mode for animating"]),
        answer: "Mode for manipulating entire objects",
        order: 9,
      },
      {
        lessonId: c2l1.id,
        text: "What does the Transform tool do?",
        options: JSON.stringify(["Move, rotate, and scale objects", "Add lights", "Create materials", "Render the scene"]),
        answer: "Move, rotate, and scale objects",
        order: 10,
      },
      // c2l2 - Low-Poly Modeling Techniques
      {
        lessonId: c2l2.id,
        text: "Why is low-poly modeling important for VR?",
        options: JSON.stringify(["Better performance", "Better colors", "Larger files", "Easier texturing"]),
        answer: "Better performance",
        order: 1,
      },
      {
        lessonId: c2l2.id,
        text: "What does 'polygon count' refer to?",
        options: JSON.stringify(["The number of polygons in a 3D model", "The number of colors used", "The file size", "The render time"]),
        answer: "The number of polygons in a 3D model",
        order: 2,
      },
      {
        lessonId: c2l2.id,
        text: "What is a 'triangle' in 3D modeling?",
        options: JSON.stringify(["The simplest polygon shape", "A modeling tool", "A type of texture", "A render setting"]),
        answer: "The simplest polygon shape",
        order: 3,
      },
      {
        lessonId: c2l2.id,
        text: "What does LOD stand for?",
        options: JSON.stringify(["Level of Detail", "Load on Demand", "Layer of Depth", "List of Data"]),
        answer: "Level of Detail",
        order: 4,
      },
      {
        lessonId: c2l2.id,
        text: "What is a 'quad' in 3D modeling?",
        options: JSON.stringify(["A four-sided polygon", "A modeling tool", "A type of camera", "A rendering technique"]),
        answer: "A four-sided polygon",
        order: 5,
      },
      {
        lessonId: c2l2.id,
        text: "What is 'retopology'?",
        options: JSON.stringify(["Recreating mesh topology with fewer polygons", "Adding more polygons", "Applying textures", "Rendering the scene"]),
        answer: "Recreating mesh topology with fewer polygons",
        order: 6,
      },
      {
        lessonId: c2l2.id,
        text: "What tool in Blender reduces polygon count?",
        options: JSON.stringify(["Decimate modifier", "Subdivision modifier", "Mirror modifier", "Array modifier"]),
        answer: "Decimate modifier",
        order: 7,
      },
      {
        lessonId: c2l2.id,
        text: "What is 'normal mapping'?",
        options: JSON.stringify(["Fake surface detail using textures", "Creating curved surfaces", "Mapping coordinates", "Rendering normals"]),
        answer: "Fake surface detail using textures",
        order: 8,
      },
      {
        lessonId: c2l2.id,
        text: "Why are low-poly models preferred for mobile VR?",
        options: JSON.stringify(["Lower hardware requirements", "Better graphics", "Larger textures", "Faster internet"]),
        answer: "Lower hardware requirements",
        order: 9,
      },
      {
        lessonId: c2l2.id,
        text: "What does 'optimization' mean in 3D modeling?",
        options: JSON.stringify(["Reducing polygon count while maintaining quality", "Increasing polygon count", "Adding more textures", "Using more lights"]),
        answer: "Reducing polygon count while maintaining quality",
        order: 10,
      },
      // c2l3 - UV Mapping Fundamentals
      {
        lessonId: c2l3.id,
        text: "What does UV mapping do?",
        options: JSON.stringify(["Maps 2D textures to 3D models", "Creates 3D models", "Renders video", "Compresses files"]),
        answer: "Maps 2D textures to 3D models",
        order: 1,
      },
      {
        lessonId: c2l3.id,
        text: "What does UV stand for?",
        options: JSON.stringify(["Texture coordinates axes", "Ultra Violet", "User View", "Universal Vector"]),
        answer: "Texture coordinates axes",
        order: 2,
      },
      {
        lessonId: c2l3.id,
        text: "What is UV unwrapping?",
        options: JSON.stringify(["Flattening a 3D surface into 2D", "Wrapping a texture around an object", "Creating a 3D model", "Rendering a scene"]),
        answer: "Flattening a 3D surface into 2D",
        order: 3,
      },
      {
        lessonId: c2l3.id,
        text: "What is a UV seam?",
        options: JSON.stringify(["A cut in the mesh for unwrapping", "A type of texture", "A modeling error", "A render setting"]),
        answer: "A cut in the mesh for unwrapping",
        order: 4,
      },
      {
        lessonId: c2l3.id,
        text: "What is 'texel density'?",
        options: JSON.stringify(["The number of texture pixels per 3D unit", "The texture file size", "The texture resolution", "The render quality"]),
        answer: "The number of texture pixels per 3D unit",
        order: 5,
      },
      {
        lessonId: c2l3.id,
        text: "What does Smart UV Project do?",
        options: JSON.stringify(["Automatically unwraps using angles", "Creates 3D models", "Applies textures", "Renders the scene"]),
        answer: "Automatically unwraps using angles",
        order: 6,
      },
      {
        lessonId: c2l3.id,
        text: "What is UV packing?",
        options: JSON.stringify(["Arranging UV islands efficiently in texture space", "Storing UV data", "Creating UV seams", "Applying textures"]),
        answer: "Arranging UV islands efficiently in texture space",
        order: 7,
      },
      {
        lessonId: c2l3.id,
        text: "What is a checker texture used for in UV mapping?",
        options: JSON.stringify(["To check for UV distortion", "To add color", "To create patterns", "To test lighting"]),
        answer: "To check for UV distortion",
        order: 8,
      },
      {
        lessonId: c2l3.id,
        text: "What is 'texture bleeding'?",
        options: JSON.stringify(["When texture pixels bleed into adjacent UV islands", "Colors mixing together", "Textures loading slowly", "Textures disappearing"]),
        answer: "When texture pixels bleed into adjacent UV islands",
        order: 9,
      },
      {
        lessonId: c2l3.id,
        text: "What is 'pixelation' in UV mapping?",
        options: JSON.stringify(["When texture resolution is too low", "When pixels are too small", "When colors are wrong", "When seams are visible"]),
        answer: "When texture resolution is too low",
        order: 10,
      },
      // c2l4 - Creating PBR Materials
      {
        lessonId: c2l4.id,
        text: "What does PBR stand for?",
        options: JSON.stringify(["Physically Based Rendering", "Post-Bake Rendering", "Pre-Built Resources", "Polygon Based Rendering"]),
        answer: "Physically Based Rendering",
        order: 1,
      },
      {
        lessonId: c2l4.id,
        text: "What is 'albedo' in PBR?",
        options: JSON.stringify(["The base color of a material", "The roughness value", "The metallic value", "The normal map"]),
        answer: "The base color of a material",
        order: 2,
      },
      {
        lessonId: c2l4.id,
        text: "What does 'roughness' control in PBR?",
        options: JSON.stringify(["How glossy or matte a surface appears", "The color intensity", "The transparency", "The height"]),
        answer: "How glossy or matte a surface appears",
        order: 3,
      },
      {
        lessonId: c2l4.id,
        text: "What is a normal map in PBR?",
        options: JSON.stringify(["A texture that simulates surface detail", "A 3D model", "A type of light", "A render setting"]),
        answer: "A texture that simulates surface detail",
        order: 4,
      },
      {
        lessonId: c2l4.id,
        text: "What does 'metallic' control in PBR?",
        options: JSON.stringify(["How much a surface behaves like metal", "The color of metal", "The weight of metal", "The temperature"]),
        answer: "How much a surface behaves like metal",
        order: 5,
      },
      {
        lessonId: c2l4.id,
        text: "What is 'ambient occlusion' in PBR?",
        options: JSON.stringify(["Shadows in crevices and corners", "Bright areas", "Reflections", "Transparency"]),
        answer: "Shadows in crevices and corners",
        order: 6,
      },
      {
        lessonId: c2l4.id,
        text: "What is 'displacement mapping'?",
        options: JSON.stringify(["Moving geometry based on a texture", "Changing colors", "Applying a decal", "Modifying UVs"]),
        answer: "Moving geometry based on a texture",
        order: 7,
      },
      {
        lessonId: c2l4.id,
        text: "What is 'subsurface scattering'?",
        options: JSON.stringify(["Light scattering beneath the surface", "Light reflecting off the surface", "Light passing through", "Light being absorbed"]),
        answer: "Light scattering beneath the surface",
        order: 8,
      },
      {
        lessonId: c2l4.id,
        text: "What is 'specular' in PBR?",
        options: JSON.stringify(["Reflections on a surface", "The base color", "The roughness map", "The height map"]),
        answer: "Reflections on a surface",
        order: 9,
      },
      {
        lessonId: c2l4.id,
        text: "What is a PBR material workflow?",
        options: JSON.stringify(["Creating realistic materials using PBR principles", "A type of rendering engine", "A modeling technique", "A UV mapping method"]),
        answer: "Creating realistic materials using PBR principles",
        order: 10,
      },
    ],
  });

  // ── Course 3: VR Interaction Design ──
  const course3 = await prisma.course.upsert({
    where: { id: "course-vr-interaction" },
    update: {},
    create: {
      id: "course-vr-interaction",
      title: "VR Interaction Design",
      description: "Design intuitive and engaging interactions for VR. Cover hand tracking, gaze interaction, spatial UI, and user experience patterns.",
      instructorId: instructor.id,
      published: true,
      category: "Design",
      difficulty: "Advanced",
      estimatedHours: 25,
    },
  });

  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course3.id, tag: "Interaction" } },
    update: {},
    create: { courseId: course3.id, tag: "Interaction" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course3.id, tag: "UX" } },
    update: {},
    create: { courseId: course3.id, tag: "UX" },
  });

  const c3m1 = await prisma.module.create({
    data: {
      title: "Fundamentals of VR Interaction",
      description: "Explore core interaction paradigms in VR including hand controllers, gaze, and gesture recognition.",
      order: 1,
      courseId: course3.id,
    },
  });

  const c3m2 = await prisma.module.create({
    data: {
      title: "Building Spatial UI",
      description: "Design and implement user interfaces that exist in 3D space and respond to natural interactions.",
      order: 2,
      courseId: course3.id,
    },
  });

  const c3l1 = await prisma.lesson.create({
    data: {
      title: "Hand Tracking Basics",
      description: "Learn how hand tracking works in VR and how to implement natural hand interactions.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=6PSLfRsN89g",
      duration: 850,
      moduleId: c3m1.id,
    },
  });

  const c3l2 = await prisma.lesson.create({
    data: {
      title: "Gaze-Based Interaction",
      description: "Implement gaze-based selection and navigation patterns for VR experiences.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=Qb_8POkFwlk",
      duration: 650,
      moduleId: c3m1.id,
    },
  });

  const c3l3 = await prisma.lesson.create({
    data: {
      title: "Designing 3D Menus",
      description: "Create intuitive 3D menus that users can interact with naturally in a VR environment.",
      type: "VIDEO",
      order: 1,
      videoUrl: "https://www.youtube.com/watch?v=4gJDKUh0_wc",
      duration: 1000,
      moduleId: c3m2.id,
    },
  });

  const c3l4 = await prisma.lesson.create({
    data: {
      title: "User Testing in VR",
      description: "Learn methodologies for testing and iterating on VR interactions with real users.",
      type: "VIDEO",
      order: 2,
      videoUrl: "https://www.youtube.com/watch?v=i6fCFnmGtv8",
      duration: 550,
      moduleId: c3m2.id,
    },
  });

  await prisma.question.createMany({
    data: [
      // c3l1 - Hand Tracking Basics
      {
        lessonId: c3l1.id,
        text: "What is hand tracking in VR?",
        options: JSON.stringify(["Tracking hand movements without controllers", "Using a keyboard in VR", "Motion capture suits", "Eye tracking"]),
        answer: "Tracking hand movements without controllers",
        order: 1,
      },
      {
        lessonId: c3l1.id,
        text: "What technology enables hand tracking?",
        options: JSON.stringify(["Computer vision and cameras", "Ultrasound", "Infrared sensors only", "GPS"]),
        answer: "Computer vision and cameras",
        order: 2,
      },
      {
        lessonId: c3l1.id,
        text: "What is 'hand presence'?",
        options: JSON.stringify(["The feeling of having virtual hands", "Actually touching objects", "Haptic feedback", "Controller tracking"]),
        answer: "The feeling of having virtual hands",
        order: 3,
      },
      {
        lessonId: c3l1.id,
        text: "What is a 'pinch gesture'?",
        options: JSON.stringify(["Touching thumb to another finger", "Making a fist", "Waving", "Pointing"]),
        answer: "Touching thumb to another finger",
        order: 4,
      },
      {
        lessonId: c3l1.id,
        text: "What is 'skeletal tracking'?",
        options: JSON.stringify(["Tracking individual finger joints", "Tracking the whole body", "Tracking head only", "Tracking eye movement"]),
        answer: "Tracking individual finger joints",
        order: 5,
      },
      {
        lessonId: c3l1.id,
        text: "What is a 'hand mesh' in VR?",
        options: JSON.stringify(["A 3D model of the hand in VR", "A type of controller", "A tracking sensor", "A haptic glove"]),
        answer: "A 3D model of the hand in VR",
        order: 6,
      },
      {
        lessonId: c3l1.id,
        text: "What is latency in hand tracking?",
        options: JSON.stringify(["Delay between hand movement and virtual response", "The tracking range", "The field of view", "The battery life"]),
        answer: "Delay between hand movement and virtual response",
        order: 7,
      },
      {
        lessonId: c3l1.id,
        text: "What is 'gesture recognition'?",
        options: JSON.stringify(["Identifying specific hand poses", "Recognizing faces", "Voice commands", "Eye tracking"]),
        answer: "Identifying specific hand poses",
        order: 8,
      },
      {
        lessonId: c3l1.id,
        text: "What is 'haptic feedback' for hands?",
        options: JSON.stringify(["Vibrations that simulate touch", "Visual effects", "Audio cues", "Temperature changes"]),
        answer: "Vibrations that simulate touch",
        order: 9,
      },
      {
        lessonId: c3l1.id,
        text: "What is 'occlusion' in hand tracking?",
        options: JSON.stringify(["When the hand is blocked from camera view", "When tracking is accurate", "Low latency", "High frame rate"]),
        answer: "When the hand is blocked from camera view",
        order: 10,
      },
      // c3l2 - Gaze-Based Interaction
      {
        lessonId: c3l2.id,
        text: "What is gaze-based interaction?",
        options: JSON.stringify(["Selecting objects by looking at them", "Using voice commands", "Hand gestures", "Controller buttons"]),
        answer: "Selecting objects by looking at them",
        order: 1,
      },
      {
        lessonId: c3l2.id,
        text: "What is a 'gaze cursor'?",
        options: JSON.stringify(["A visual indicator of where the user is looking", "A type of menu", "A hand tracker", "A haptic device"]),
        answer: "A visual indicator of where the user is looking",
        order: 2,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'dwell time' in gaze interaction?",
        options: JSON.stringify(["How long you must look to select an object", "How fast you look around", "The time to load content", "Animation duration"]),
        answer: "How long you must look to select an object",
        order: 3,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'eye tracking'?",
        options: JSON.stringify(["Measuring where the eyes are looking", "Following eye color", "Tracking eye shape", "Measuring blink rate"]),
        answer: "Measuring where the eyes are looking",
        order: 4,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'foveated rendering'?",
        options: JSON.stringify(["Rendering high detail only where the eye is focused", "Rendering everything in high detail", "Lowering resolution overall", "Increasing field of view"]),
        answer: "Rendering high detail only where the eye is focused",
        order: 5,
      },
      {
        lessonId: c3l2.id,
        text: "What is the main advantage of gaze interaction?",
        options: JSON.stringify(["Hands-free operation", "Faster loading", "Better graphics", "Lower cost"]),
        answer: "Hands-free operation",
        order: 6,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'vergence' in eye tracking?",
        options: JSON.stringify(["The inward rotation of both eyes", "The size of the pupil", "The color of the iris", "Blink detection"]),
        answer: "The inward rotation of both eyes",
        order: 7,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'smooth pursuit' in gaze?",
        options: JSON.stringify(["Tracking a moving object with the eyes", "Quick eye movements", "Slow blinking", "Peripheral vision"]),
        answer: "Tracking a moving object with the eyes",
        order: 8,
      },
      {
        lessonId: c3l2.id,
        text: "What is 'gaze + pinch' interaction?",
        options: JSON.stringify(["Combining eye gaze with hand pinch to select", "Looking and speaking", "Staring and waiting", "Blinking to confirm"]),
        answer: "Combining eye gaze with hand pinch to select",
        order: 9,
      },
      {
        lessonId: c3l2.id,
        text: "What is a 'gaze fade'?",
        options: JSON.stringify(["A visual cue that an object can be gazed at", "A transition effect", "A loading screen", "A color change"]),
        answer: "A visual cue that an object can be gazed at",
        order: 10,
      },
      // c3l3 - Designing 3D Menus
      {
        lessonId: c3l3.id,
        text: "Why is spatial UI important in VR?",
        options: JSON.stringify(["It exists in 3D space naturally", "It's cheaper", "It loads faster", "It uses less memory"]),
        answer: "It exists in 3D space naturally",
        order: 1,
      },
      {
        lessonId: c3l3.id,
        text: "What is a 'diegetic UI'?",
        options: JSON.stringify(["UI that exists within the virtual world", "A 2D overlay", "A voice command", "A hand gesture"]),
        answer: "UI that exists within the virtual world",
        order: 2,
      },
      {
        lessonId: c3l3.id,
        text: "What is 'world space canvas'?",
        options: JSON.stringify(["UI rendered in 3D space", "A 2D screen overlay", "A type of texture", "A rendering technique"]),
        answer: "UI rendered in 3D space",
        order: 3,
      },
      {
        lessonId: c3l3.id,
        text: "What is a 'hand menu'?",
        options: JSON.stringify(["A menu attached to the user's hand", "A menu opened by waving", "A touchscreen menu", "A voice menu"]),
        answer: "A menu attached to the user's hand",
        order: 4,
      },
      {
        lessonId: c3l3.id,
        text: "What is a 'radial menu'?",
        options: JSON.stringify(["A circular menu around the hand or controller", "A linear list of options", "A grid of buttons", "A dropdown menu"]),
        answer: "A circular menu around the hand or controller",
        order: 5,
      },
      {
        lessonId: c3l3.id,
        text: "What is 'UI depth' in VR?",
        options: JSON.stringify(["How far UI elements are from the user", "The number of UI layers", "The menu hierarchy", "The color intensity"]),
        answer: "How far UI elements are from the user",
        order: 6,
      },
      {
        lessonId: c3l3.id,
        text: "What is 'clipping' in VR UI?",
        options: JSON.stringify(["When UI elements intersect with world objects", "Cutting UI elements", "UI animation", "Transition effects"]),
        answer: "When UI elements intersect with world objects",
        order: 7,
      },
      {
        lessonId: c3l3.id,
        text: "What are 'grabbable UI' elements?",
        options: JSON.stringify(["UI that can be physically grabbed", "UI that can be clicked", "UI that auto-hides", "UI that plays sound"]),
        answer: "UI that can be physically grabbed",
        order: 8,
      },
      {
        lessonId: c3l3.id,
        text: "What is a 'tooltip' in VR?",
        options: JSON.stringify(["Info that appears when pointing at an object", "A type of menu", "A hand gesture", "A voice command"]),
        answer: "Info that appears when pointing at an object",
        order: 9,
      },
      {
        lessonId: c3l3.id,
        text: "What is 'non-diegetic UI'?",
        options: JSON.stringify(["UI overlay that exists outside the virtual world", "UI inside the virtual world", "A hand gesture", "A voice command"]),
        answer: "UI overlay that exists outside the virtual world",
        order: 10,
      },
      // c3l4 - User Testing in VR
      {
        lessonId: c3l4.id,
        text: "What is a key consideration when testing VR interactions?",
        options: JSON.stringify(["User comfort", "File size", "Color scheme", "Loading speed"]),
        answer: "User comfort",
        order: 1,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'think-aloud protocol' in VR testing?",
        options: JSON.stringify(["Users verbalize their thoughts while testing", "Silent observation", "Automated testing", "Survey after testing"]),
        answer: "Users verbalize their thoughts while testing",
        order: 2,
      },
      {
        lessonId: c3l4.id,
        text: "What is a 'presence questionnaire'?",
        options: JSON.stringify(["A survey measuring immersion", "A performance test", "A graphics benchmark", "A loading test"]),
        answer: "A survey measuring immersion",
        order: 3,
      },
      {
        lessonId: c3l4.id,
        text: "What is the Simulator Sickness Questionnaire (SSQ)?",
        options: JSON.stringify(["A tool to measure motion sickness", "A hardware test", "A graphics test", "A network test"]),
        answer: "A tool to measure motion sickness",
        order: 4,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'A/B testing' in VR?",
        options: JSON.stringify(["Comparing two different interaction designs", "Testing with two users", "Testing twice", "Using two headsets"]),
        answer: "Comparing two different interaction designs",
        order: 5,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'task completion time'?",
        options: JSON.stringify(["How long a user takes to complete a task", "Loading time", "Render time", "Development time"]),
        answer: "How long a user takes to complete a task",
        order: 6,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'heat mapping' in VR?",
        options: JSON.stringify(["Visualizing where users look", "Temperature measurement", "CPU temperature", "Graphics heat"]),
        answer: "Visualizing where users look",
        order: 7,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'user observation'?",
        options: JSON.stringify(["Watching users interact without interference", "Interviewing users", "Surveying users", "Automated tracking"]),
        answer: "Watching users interact without interference",
        order: 8,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'iterative design'?",
        options: JSON.stringify(["Repeatedly testing and refining a design", "Designing once", "Linear development", "Waterfall methodology"]),
        answer: "Repeatedly testing and refining a design",
        order: 9,
      },
      {
        lessonId: c3l4.id,
        text: "What is 'pilot testing'?",
        options: JSON.stringify(["A small-scale trial before full testing", "The final test", "Automated testing", "Hardware testing"]),
        answer: "A small-scale trial before full testing",
        order: 10,
      },
    ],
  });

  // ── Extra non-video lessons ──

  // Course 1 - Module 3: VR Applications
  const c1m3 = await prisma.module.create({
    data: {
      title: "VR Applications",
      description: "Real-world applications of VR across different industries",
      order: 3,
      courseId: course1.id,
    },
  });

  const c1l5 = await prisma.lesson.create({
    data: {
      title: "VR in Healthcare",
      description: "Exploring how VR is transforming medical training, therapy, and patient care through immersive simulations.",
      content: "Virtual Reality is revolutionizing healthcare in unprecedented ways. From surgical training simulations that allow medical students to practice complex procedures without risk to patients, to therapeutic applications for treating PTSD, anxiety disorders, and phobias — VR is opening new frontiers in medicine.\n\nKey Applications:\n\n1. Surgical Training: VR simulators provide realistic surgical environments where trainees can practice procedures repeatedly. Studies show that VR-trained surgeons make 40% fewer errors than traditionally trained ones.\n\n2. Pain Management: VR distraction therapy is being used to reduce pain perception during wound care, dental procedures, and physical therapy. The immersive nature of VR effectively diverts the brain's attention from pain signals.\n\n3. Physical Rehabilitation: VR-based rehabilitation programs make recovery exercises engaging and track patient progress precisely. Patients are more motivated to complete their exercises when they're part of an immersive game.\n\n4. Mental Health Treatment: Exposure therapy using VR allows therapists to create controlled environments for treating phobias, social anxiety, and PTSD. Patients can face their fears in a safe, controlled setting.\n\nThe future of VR in healthcare is bright, with ongoing research into haptic feedback systems for remote surgery, VR-based diagnostic tools, and collaborative virtual environments for medical team training.",
      type: "ARTICLE",
      order: 1,
      duration: 800,
      moduleId: c1m3.id,
    },
  });

  const c1l6 = await prisma.lesson.create({
    data: {
      title: "VR in Education",
      description: "How VR creates immersive learning experiences for students across disciplines from history to physics.",
      content: "Education is undergoing a transformation through Virtual Reality. Traditional learning methods are being enhanced by immersive experiences that make abstract concepts tangible and history lessons unforgettable.\n\nWhy VR Works for Learning:\n\n1. Immersive Engagement: When students wear a VR headset, they enter a world where they must actively participate. This active engagement leads to higher retention rates compared to passive learning methods.\n\n2. Experiential Learning: Instead of reading about the Roman Colosseum, students can walk through it. Instead of memorizing the solar system, they can float through space and observe planets up close.\n\n3. Safe Experimentation: Chemistry students can conduct dangerous experiments virtually. Physics students can manipulate gravity. Biology students can explore the human body from the inside.\n\n4. Accessibility: VR brings field trips to students who cannot physically travel. A classroom in rural Philippines can explore the Louvre, walk on Mars, or dive into the Great Barrier Reef.\n\nEducational institutions worldwide are adopting VR for:\n- Virtual science laboratories\n- Historical reenactments and time travel experiences\n- Language learning through immersive environments\n- Vocational training simulations\n- Collaborative projects in shared virtual spaces\n\nResearch indicates that VR learners demonstrate 30% better recall and 40% faster skill acquisition than traditional methods. As VR hardware becomes more affordable, its role in education will only expand.",
      type: "ARTICLE",
      order: 2,
      duration: 700,
      moduleId: c1m3.id,
    },
  });

  // Course 2 - Module 3: Exporting and Deployment
  const c2m3 = await prisma.module.create({
    data: {
      title: "Exporting and Deployment",
      description: "Optimize and export 3D assets for use in VR game engines",
      order: 3,
      courseId: course2.id,
    },
  });

  const c2l5 = await prisma.lesson.create({
    data: {
      title: "Optimizing Assets for VR",
      description: "Techniques for optimizing 3D models, textures, and materials to maintain high performance in VR.",
      content: "Performance optimization is critical in VR development. Unlike traditional 3D applications, VR requires maintaining a consistent 90 frames per second (or higher) to prevent motion sickness and ensure a comfortable experience.\n\nKey Optimization Techniques:\n\n1. Polygon Reduction: High-polygon models must be optimized for VR. Use decimation tools in Blender or Maya to reduce vertex count while preserving visual quality. Aim for LODs (Level of Detail) that swap lower-detail models at distance.\n\n2. Texture Optimization: Use texture atlases to combine multiple textures into a single sheet, reducing draw calls. Compress textures to appropriate formats (BC7 for PC VR, ASTC for mobile VR). Keep texture resolutions at 1024x1024 or lower for most objects.\n\n3. Batching and Instancing: Combine static objects into single meshes where possible. Use GPU instancing for repeated objects like trees, rocks, or buildings.\n\n4. Occlusion Culling: Implement occlusion culling to avoid rendering objects that are not visible to the camera. Unity and Unreal both have built-in occlusion culling systems.\n\n5. Lighting Optimization: Bake lighting into lightmaps when possible. Real-time lighting is expensive in VR. Use a single directional light for real-time shadows.\n\n6. Draw Call Budget: Keep draw calls under 200-300 for mobile VR and under 2000 for PC VR. Use the Frame Debugger in Unity or Unreal to analyze your draw calls.\n\nRemember: A smooth 90fps experience with simpler graphics is always better than a stuttering experience with high-end visuals.",
      type: "ARTICLE",
      order: 1,
      duration: 900,
      moduleId: c2m3.id,
    },
  });

  const c2l6 = await prisma.lesson.create({
    data: {
      title: "Exporting to Unity and Unreal",
      description: "Best practices for exporting Blender models to Unity and Unreal Engine with correct materials and scale.",
      content: "Properly exporting 3D models from Blender to game engines is essential for maintaining visual quality and avoiding frustrating issues.\n\nScale and Units:\n- Blender uses meters by default. Set your scene units to meters.\n- Unity: 1 unit = 1 meter. Models should be at real-world scale.\n- Unreal: 1 unit = 1 centimeter. A 1.8m character = 180 Unreal units.\n- Solution: Export from Blender with scale 100 for Unreal, or set import scale in the engine.\n\nExport Settings (FBX):\n1. Select your objects and apply all transforms (Ctrl+A > Rotation & Scale)\n2. Check 'Apply Scalefs' in the FBX export settings\n3. Set Forward to -Z Forward (Unity) or +Z Forward (Unreal)\n4. Set Up to Y Up (both engines)\n5. Enable 'Apply Unit' to maintain correct scale\n6. Enable 'Embed Textures' to pack textures into the FBX\n\nMaterials:\n- Unity Standard shader maps: Albedo (Base Color), Metallic, Normal, Height, Occlusion, Emission\n- Unreal: Base Color, Metallic, Specular, Roughness, Normal\n- Blender Principled BSDF translates well to both engines\n- Use texture names that match: _Albedo, _Normal, _Metallic, _Roughness\n\nCommon Issues and Fixes:\n- Smooth shading looks faceted: Add Edge Split or Bevel modifiers\n- Textures missing: Embed textures in FBX or copy texture files manually\n- Wrong rotation: Check Forward/Up axes in export settings\n- Scale wrong: Verify unit settings before export\n\nAlways test your exported model in the target engine before finalizing your workflow.",
      type: "ARTICLE",
      order: 2,
      duration: 750,
      moduleId: c2m3.id,
    },
  });

  // Course 3 - Module 3: Advanced Interaction Patterns
  const c3m3 = await prisma.module.create({
    data: {
      title: "Advanced Interaction Patterns",
      description: "Explore multi-user experiences and emerging interaction paradigms in VR",
      order: 3,
      courseId: course3.id,
    },
  });

  const c3l5 = await prisma.lesson.create({
    data: {
      title: "Multi-User Interaction",
      description: "Designing social VR experiences with multiple users interacting in shared virtual spaces.",
      content: "Multi-user VR experiences represent the frontier of social interaction in digital spaces. Designing for multiple users introduces unique challenges and opportunities that single-user experiences don't have.\n\nCore Design Principles:\n\n1. Presence and Avatars: Users need to feel present with each other. Full-body IK (Inverse Kinematics) solutions create natural-looking avatars. At minimum, hands and head presence is essential for basic interaction.\n\n2. Voice Communication: Spatial audio is crucial. Users should hear others based on their virtual position. Proximity-based audio creates natural conversation groups.\n\n3. Shared Interactions: Objects in the world must be synchronized. When one user picks up an object, others should see it move. This requires robust networking with state synchronization.\n\n4. Social Etiquette: Design for personal space bubbles to prevent uncomfortable proximity. Implement mute/report features for safety.\n\nTechnical Considerations:\n- Photon, Normcore, and Unity Netcode are popular networking solutions\n- Budget for bandwidth — sync only what's necessary\n- Use interest management to only sync data relevant to each user\n- Implement lag compensation for smooth interactions\n\nMulti-user VR is being used in education (virtual classrooms), enterprise (meetings and design reviews), entertainment (social games and events), and therapy (group therapy sessions).",
      type: "ARTICLE",
      order: 1,
      duration: 850,
      moduleId: c3m3.id,
    },
  });

  // Questions for extra lessons
  await prisma.question.createMany({
    data: [
      // c1l5 - VR in Healthcare
      {
        lessonId: c1l5.id,
        text: "How is VR used in surgical training?",
        options: JSON.stringify(["Virtual simulations for practice", "Live surgeries", "Patient monitoring", "Hospital administration"]),
        answer: "Virtual simulations for practice",
        order: 1,
      },
      {
        lessonId: c1l5.id,
        text: "What is VR exposure therapy used for?",
        options: JSON.stringify(["Treating phobias and PTSD", "Physical exercise", "Vision testing", "Hearing tests"]),
        answer: "Treating phobias and PTSD",
        order: 2,
      },
      {
        lessonId: c1l5.id,
        text: "How does VR help with pain management?",
        options: JSON.stringify(["Distracting patients with immersive environments", "Prescribing medication", "Physical therapy", "Surgery"]),
        answer: "Distracting patients with immersive environments",
        order: 3,
      },
      {
        lessonId: c1l5.id,
        text: "What is VR rehabilitation?",
        options: JSON.stringify(["Using VR for physical therapy exercises", "Virtual doctor visits", "Medical training", "Hospital tours"]),
        answer: "Using VR for physical therapy exercises",
        order: 4,
      },
      {
        lessonId: c1l5.id,
        text: "How is VR used in medical education?",
        options: JSON.stringify(["3D anatomy visualization and simulation", "Online lectures only", "Textbook replacement", "Video playback"]),
        answer: "3D anatomy visualization and simulation",
        order: 5,
      },
      {
        lessonId: c1l5.id,
        text: "What is 'VR analgesia'?",
        options: JSON.stringify(["Pain relief through VR immersion", "A type of surgery", "A diagnostic tool", "A medication"]),
        answer: "Pain relief through VR immersion",
        order: 6,
      },
      {
        lessonId: c1l5.id,
        text: "How does VR assist with mental health treatment?",
        options: JSON.stringify(["Controlled environment therapy sessions", "Replacing medication", "Diagnosing illnesses", "Physical exams"]),
        answer: "Controlled environment therapy sessions",
        order: 7,
      },
      {
        lessonId: c1l5.id,
        text: "What is VR used for in emergency response training?",
        options: JSON.stringify(["Simulating crisis scenarios", "Mapping routes", "Tracking supplies", "Communication"]),
        answer: "Simulating crisis scenarios",
        order: 8,
      },
      {
        lessonId: c1l5.id,
        text: "How does VR benefit patient education?",
        options: JSON.stringify(["Visualizing procedures and conditions in 3D", "Replacing doctor consultations", "Automated diagnosis", "Prescription management"]),
        answer: "Visualizing procedures and conditions in 3D",
        order: 9,
      },
      {
        lessonId: c1l5.id,
        text: "What is a key challenge of VR in healthcare?",
        options: JSON.stringify(["Ensuring medical accuracy and safety", "Cost of hardware only", "Internet speed", "Screen resolution"]),
        answer: "Ensuring medical accuracy and safety",
        order: 10,
      },
      // c1l6 - VR in Education
      {
        lessonId: c1l6.id,
        text: "How does VR enhance classroom learning?",
        options: JSON.stringify(["Immersive experiences that improve engagement", "Replacing teachers", "Automated grading", "Video playback"]),
        answer: "Immersive experiences that improve engagement",
        order: 1,
      },
      {
        lessonId: c1l6.id,
        text: "What is 'virtual field trip' in education?",
        options: JSON.stringify(["Exploring historical or remote locations in VR", "A physical school trip", "An online video tour", "A textbook chapter"]),
        answer: "Exploring historical or remote locations in VR",
        order: 2,
      },
      {
        lessonId: c1l6.id,
        text: "How does VR help in science education?",
        options: JSON.stringify(["3D visualization of molecules and physics", "Reading textbooks", "Watching videos", "Taking notes"]),
        answer: "3D visualization of molecules and physics",
        order: 3,
      },
      {
        lessonId: c1l6.id,
        text: "What is 'spatial learning' in VR?",
        options: JSON.stringify(["Learning through 3D spatial relationships", "Learning in a classroom", "Online learning", "Group study"]),
        answer: "Learning through 3D spatial relationships",
        order: 4,
      },
      {
        lessonId: c1l6.id,
        text: "How does VR support skill training?",
        options: JSON.stringify(["Hands-on practice in a safe environment", "Reading manuals", "Watching tutorials", "Taking tests"]),
        answer: "Hands-on practice in a safe environment",
        order: 5,
      },
      {
        lessonId: c1l6.id,
        text: "What is collaborative learning in VR?",
        options: JSON.stringify(["Multiple students in the same virtual space", "Group projects in class", "Online forums", "Study groups"]),
        answer: "Multiple students in the same virtual space",
        order: 6,
      },
      {
        lessonId: c1l6.id,
        text: "How does VR benefit history education?",
        options: JSON.stringify(["Recreating historical events and environments", "Reading historical texts", "Watching documentaries", "Memorizing dates"]),
        answer: "Recreating historical events and environments",
        order: 7,
      },
      {
        lessonId: c1l6.id,
        text: "What is a challenge of VR in education?",
        options: JSON.stringify(["Hardware cost and accessibility", "Lack of content", "Teacher training only", "Internet speed"]),
        answer: "Hardware cost and accessibility",
        order: 8,
      },
      {
        lessonId: c1l6.id,
        text: "How does VR help students with special needs?",
        options: JSON.stringify(["Customizable learning environments", "Standardized tests", "Group activities", "Video lessons"]),
        answer: "Customizable learning environments",
        order: 9,
      },
      {
        lessonId: c1l6.id,
        text: "What is 'gamification' in VR education?",
        options: JSON.stringify(["Using game mechanics to enhance learning", "Playing educational games only", "Competitive testing", "Reward systems"]),
        answer: "Using game mechanics to enhance learning",
        order: 10,
      },
      // c2l5 - Optimizing Assets for VR
      {
        lessonId: c2l5.id,
        text: "Why is asset optimization important for VR?",
        options: JSON.stringify(["To maintain high frame rates", "To improve colors", "To increase file size", "To add more polygons"]),
        answer: "To maintain high frame rates",
        order: 1,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'draw call' optimization?",
        options: JSON.stringify(["Reducing the number of render calls", "Drawing more objects", "Increasing resolution", "Adding more lights"]),
        answer: "Reducing the number of render calls",
        order: 2,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'texture atlasing'?",
        options: JSON.stringify(["Combining multiple textures into one", "Increasing texture resolution", "Adding more textures", "Removing textures"]),
        answer: "Combining multiple textures into one",
        order: 3,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'LOD' used for in VR?",
        options: JSON.stringify(["Switching lower detail models at a distance", "Adding more detail", "Loading textures", "Rendering shadows"]),
        answer: "Switching lower detail models at a distance",
        order: 4,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'batching' in VR rendering?",
        options: JSON.stringify(["Grouping objects to reduce draw calls", "Combining textures", "Merging materials", "Instancing objects"]),
        answer: "Grouping objects to reduce draw calls",
        order: 5,
      },
      {
        lessonId: c2l5.id,
        text: "What texture resolution is recommended for mobile VR?",
        options: JSON.stringify(["1024x1024 or lower", "4096x4096", "8192x8192", "Any resolution"]),
        answer: "1024x1024 or lower",
        order: 6,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'occlusion culling' used for?",
        options: JSON.stringify(["Not rendering objects hidden behind others", "Removing objects completely", "Hiding UI elements", "Optimizing audio"]),
        answer: "Not rendering objects hidden behind others",
        order: 7,
      },
      {
        lessonId: c2l5.id,
        text: "What is the recommended polygon count for mobile VR assets?",
        options: JSON.stringify(["Under 5000 triangles", "Over 100000 triangles", "Any count", "Exactly 1000"]),
        answer: "Under 5000 triangles",
        order: 8,
      },
      {
        lessonId: c2l5.id,
        text: "How does 'mipmapping' help VR performance?",
        options: JSON.stringify(["Using smaller textures at a distance", "Increasing texture quality", "Adding more textures", "Removing textures"]),
        answer: "Using smaller textures at a distance",
        order: 9,
      },
      {
        lessonId: c2l5.id,
        text: "What is 'LOD popping'?",
        options: JSON.stringify(["Visible transition between LOD levels", "Loading delays", "Texture artifacts", "Sound glitches"]),
        answer: "Visible transition between LOD levels",
        order: 10,
      },
      // c2l6 - Exporting to Unity and Unreal
      {
        lessonId: c2l6.id,
        text: "What file format preserves materials from Blender to Unity?",
        options: JSON.stringify(["FBX", "OBJ", "STL", "PLY"]),
        answer: "FBX",
        order: 1,
      },
      {
        lessonId: c2l6.id,
        text: "What is the default unit scale for Unity?",
        options: JSON.stringify(["1 unit = 1 meter", "1 unit = 1 foot", "1 unit = 1 inch", "1 unit = 1 centimeter"]),
        answer: "1 unit = 1 meter",
        order: 2,
      },
      {
        lessonId: c2l6.id,
        text: "What scale should Blender objects be exported at for Unity?",
        options: JSON.stringify(["1 (apply scale)", "0.01", "100", "Any scale"]),
        answer: "1 (apply scale)",
        order: 3,
      },
      {
        lessonId: c2l6.id,
        text: "What is 'glTF' format best used for?",
        options: JSON.stringify(["Web and mobile VR applications", "High-end desktop games", "3D printing", "Video editing"]),
        answer: "Web and mobile VR applications",
        order: 4,
      },
      {
        lessonId: c2l6.id,
        text: "How should textures be exported for PBR materials?",
        options: JSON.stringify(["As separate PNG or JPEG files", "Embedded in the 3D file", "As a single combined file", "As vector graphics"]),
        answer: "As separate PNG or JPEG files",
        order: 5,
      },
      {
        lessonId: c2l6.id,
        text: "What is 'apply transforms' before export?",
        options: JSON.stringify(["Resetting location, rotation, and scale to defaults", "Deleting modifiers", "Applying materials", "Adding animations"]),
        answer: "Resetting location, rotation, and scale to defaults",
        order: 6,
      },
      {
        lessonId: c2l6.id,
        text: "What does 'combine objects' do before export?",
        options: JSON.stringify(["Merges multiple objects into one mesh", "Groups objects together", "Deletes duplicate objects", "Applies materials"]),
        answer: "Merges multiple objects into one mesh",
        order: 7,
      },
      {
        lessonId: c2l6.id,
        text: "What is 'normal orientation' in export?",
        options: JSON.stringify(["Ensuring all face normals point outward", "Setting the camera angle", "Adjusting light direction", "Texture alignment"]),
        answer: "Ensuring all face normals point outward",
        order: 8,
      },
      {
        lessonId: c2l6.id,
        text: "What Unreal Engine scale should Blender use?",
        options: JSON.stringify(["1 Blender unit = 1 Unreal unit", "1 Blender unit = 100 Unreal units", "1 Blender unit = 0.01 Unreal units", "No conversion needed"]),
        answer: "1 Blender unit = 1 Unreal unit",
        order: 9,
      },
      {
        lessonId: c2l6.id,
        text: "What is 'embedded textures' in FBX export?",
        options: JSON.stringify(["Textures packed inside the FBX file", "Textures stored separately", "Compressed textures", "Missing textures"]),
        answer: "Textures packed inside the FBX file",
        order: 10,
      },
      // c3l5 - Multi-User Interaction
      {
        lessonId: c3l5.id,
        text: "What is multi-user VR?",
        options: JSON.stringify(["Multiple people in the same virtual space", "Single player experience", "Split-screen mode", "Online forum"]),
        answer: "Multiple people in the same virtual space",
        order: 1,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'avatar' in social VR?",
        options: JSON.stringify(["A digital representation of a user", "A type of VR headset", "A controller", "A virtual object"]),
        answer: "A digital representation of a user",
        order: 2,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'synchronization' in multi-user VR?",
        options: JSON.stringify(["Keeping all users' views consistent", "Syncing audio", "Loading times", "Graphics settings"]),
        answer: "Keeping all users' views consistent",
        order: 3,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'network latency' in VR?",
        options: JSON.stringify(["Delay in data transmission between users", "Loading textures", "Rendering frames", "Battery drain"]),
        answer: "Delay in data transmission between users",
        order: 4,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'voice chat' in social VR?",
        options: JSON.stringify(["Real-time audio communication between users", "Text messaging", "Video calls", "Email"]),
        answer: "Real-time audio communication between users",
        order: 5,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'personal space' in VR?",
        options: JSON.stringify(["A comfort zone around each user's avatar", "A private room", "The headset display", "The tracking area"]),
        answer: "A comfort zone around each user's avatar",
        order: 6,
      },
      {
        lessonId: c3l5.id,
        text: "How do users interact with each other in VR?",
        options: JSON.stringify(["Gestures, voice, and avatar proximity", "Only voice calls", "Only text chat", "Email only"]),
        answer: "Gestures, voice, and avatar proximity",
        order: 7,
      },
      {
        lessonId: c3l5.id,
        text: "What is 'shared object manipulation'?",
        options: JSON.stringify(["Multiple users interacting with the same object", "Single user interaction", "Object duplication", "Object deletion"]),
        answer: "Multiple users interacting with the same object",
        order: 8,
      },
      {
        lessonId: c3l5.id,
        text: "What is a 'virtual handshake'?",
        options: JSON.stringify(["A social gesture between avatars", "A controller input", "A menu option", "A voice command"]),
        answer: "A social gesture between avatars",
        order: 9,
      },
      {
        lessonId: c3l5.id,
        text: "What is the main challenge of multi-user VR?",
        options: JSON.stringify(["Network synchronization and latency", "Graphics quality", "Audio quality", "Controller tracking"]),
        answer: "Network synchronization and latency",
        order: 10,
      },
    ],
  });
  // ── Course 4: VR Game Development with Unity ──
  const course4 = await prisma.course.upsert({
    where: { id: "course-vr-gamedev" },
    update: {},
    create: {
      id: "course-vr-gamedev",
      title: "VR Game Development with Unity",
      description: "Build complete VR games using Unity and the XR Interaction Toolkit. Cover player movement, object interaction, UI systems, and game mechanics.",
      instructorId: instructor.id,
      published: true,
      category: "Technology",
      difficulty: "Intermediate",
      estimatedHours: 35,
    },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course4.id, tag: "Unity" } },
    update: {},
    create: { courseId: course4.id, tag: "Unity" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course4.id, tag: "GameDev" } },
    update: {},
    create: { courseId: course4.id, tag: "GameDev" },
  });

  const c4m1 = await prisma.module.create({
    data: { title: "Unity Basics for VR", description: "Set up Unity for VR development and understand the core components", order: 1, courseId: course4.id },
  });
  const c4m2 = await prisma.module.create({
    data: { title: "Building VR Game Mechanics", description: "Implement interactions, locomotion, and game logic", order: 2, courseId: course4.id },
  });

  const c4l1 = await prisma.lesson.create({
    data: { title: "Setting Up Unity for VR", description: "Install and configure Unity with OpenXR and XR Interaction Toolkit for VR development.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=YBQ_ps6e71k", duration: 1200, moduleId: c4m1.id },
  });
  const c4l2 = await prisma.lesson.create({
    data: { title: "Unity XR Architecture", description: "Understand the XR subsystem, XR Rig, and how Unity handles VR input and tracking.", type: "ARTICLE", order: 2, duration: 600, moduleId: c4m1.id },
  });
  const c4l3 = await prisma.lesson.create({
    data: { title: "VR Interaction Components", description: "Implement grab, throw, teleport, and UI interactions using the XR Interaction Toolkit.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=Qb_8POkFwlk", duration: 1000, moduleId: c4m2.id },
  });
  const c4l4 = await prisma.lesson.create({
    data: { title: "VR Game Logic and Scoring", description: "Build game mechanics like scoring, timers, spawning, and win/lose conditions in VR.", type: "ARTICLE", order: 2, duration: 700, moduleId: c4m2.id },
  });

  await prisma.question.createMany({
    data: [
      { lessonId: c4l1.id, text: "What is OpenXR?", options: JSON.stringify(["An open standard for VR/AR platforms", "A Unity package", "A VR headset", "A game engine"]), answer: "An open standard for VR/AR platforms", order: 1 },
      { lessonId: c4l1.id, text: "What does XR Rig provide?", options: JSON.stringify(["Camera and controller tracking setup", "Graphics rendering", "Audio playback", "Network connectivity"]), answer: "Camera and controller tracking setup", order: 2 },
      { lessonId: c4l1.id, text: "Which package is essential for VR interactions in Unity?", options: JSON.stringify(["XR Interaction Toolkit", "Universal RP", "Shader Graph", "Timeline"]), answer: "XR Interaction Toolkit", order: 3 },
      { lessonId: c4l1.id, text: "What is the first step in Unity VR setup?", options: JSON.stringify(["Install XR Plugin Management", "Create a script", "Build the project", "Add lighting"]), answer: "Install XR Plugin Management", order: 4 },
      { lessonId: c4l1.id, text: "What does 'single-pass instanced' rendering do?", options: JSON.stringify(["Renders both eyes efficiently", "Renders one eye at a time", "Increases quality", "Reduces latency"]), answer: "Renders both eyes efficiently", order: 5 },
      { lessonId: c4l1.id, text: "What platform target is typical for Quest VR builds?", options: JSON.stringify(["Android", "iOS", "Windows", "Linux"]), answer: "Android", order: 6 },
      { lessonId: c4l1.id, text: "What is the purpose of the XR Rig prefab?", options: JSON.stringify(["Manages VR camera and controllers", "Handles physics", "Renders graphics", "Plays audio"]), answer: "Manages VR camera and controllers", order: 7 },
      { lessonId: c4l1.id, text: "What does 'XR Origin' replace in newer Unity versions?", options: JSON.stringify(["XR Rig", "Main Camera", "Input System", "Render Pipeline"]), answer: "XR Rig", order: 8 },
      { lessonId: c4l1.id, text: "What is 'tracking origin mode'?", options: JSON.stringify(["Defines the tracking reference point", "Sets render resolution", "Configures audio", "Adjusts lighting"]), answer: "Defines the tracking reference point", order: 9 },
      { lessonId: c4l1.id, text: "What build settings are needed for Quest VR?", options: JSON.stringify(["Android with IL2CPP and ARM64", "iOS with Mono", "Windows with x86", "WebGL"]), answer: "Android with IL2CPP and ARM64", order: 10 },
      { lessonId: c4l2.id, text: "What is the XR Subsystem?", options: JSON.stringify(["A layer managing VR platform communication", "A render pipeline", "An audio system", "A physics engine"]), answer: "A layer managing VR platform communication", order: 1 },
      { lessonId: c4l2.id, text: "How does Unity handle VR input?", options: JSON.stringify(["Through the Input System and XR Plugin", "Direct hardware access", "Third-party libraries", "Custom drivers"]), answer: "Through the Input System and XR Plugin", order: 2 },
      { lessonId: c4l2.id, text: "What is 'action-based' input in XR?", options: JSON.stringify(["Input mapped to abstract actions", "Direct button mapping", "Hardware-specific input", "Mouse and keyboard"]), answer: "Input mapped to abstract actions", order: 3 },
      { lessonId: c4l2.id, text: "What does 'device-based' input use?", options: JSON.stringify(["Specific controller button bindings", "Abstract actions", "Voice commands", "Gesture recognition"]), answer: "Specific controller button bindings", order: 4 },
      { lessonId: c4l2.id, text: "What is the Tracking Origin Mode 'Floor'?", options: JSON.stringify(["Tracking relative to the floor", "Tracking relative to the head", "Tracking relative to the controller", "No tracking"]), answer: "Tracking relative to the floor", order: 5 },
      { lessonId: c4l2.id, text: "What is the XR Rig's Camera Offset object?", options: JSON.stringify(["Handles camera position relative to the rig", "Renders the scene", "Manages audio", "Controls lighting"]), answer: "Handles camera position relative to the rig", order: 6 },
      { lessonId: c4l2.id, text: "What does 'XR Plugin Management' handle?", options: JSON.stringify(["Loading and initializing VR SDKs", "Game object management", "Scene loading", "Asset importing"]), answer: "Loading and initializing VR SDKs", order: 7 },
      { lessonId: c4l2.id, text: "What is 'play mode' in XR development?", options: JSON.stringify(["Testing VR in the Unity editor with a headset", "Building the game", "Editing scripts", "Creating assets"]), answer: "Testing VR in the Unity editor with a headset", order: 8 },
      { lessonId: c4l2.id, text: "What is 'simulate in editor' for XR?", options: JSON.stringify(["Test VR input without a headset", "Build the game faster", "Edit scenes in 2D", "Debug scripts"]), answer: "Test VR input without a headset", order: 9 },
      { lessonId: c4l2.id, text: "What is the role of XR SDKs in Unity?", options: JSON.stringify(["Bridge between Unity and VR hardware", "Render graphics", "Manage files", "Handle networking"]), answer: "Bridge between Unity and VR hardware", order: 10 },
      { lessonId: c4l3.id, text: "What does XR Grab Interactable allow?", options: JSON.stringify(["Picking up and moving objects", "Looking at objects", "Walking through walls", "Playing sounds"]), answer: "Picking up and moving objects", order: 1 },
      { lessonId: c4l3.id, text: "What is Teleportation Area used for?", options: JSON.stringify(["A zone where the player can teleport", "A visual effect", "A sound trigger", "A collision zone"]), answer: "A zone where the player can teleport", order: 2 },
      { lessonId: c4l3.id, text: "What does XR Socket Interactor do?", options: JSON.stringify(["Holds objects in a fixed position", "Teleports the player", "Plays animations", "Changes materials"]), answer: "Holds objects in a fixed position", order: 3 },
      { lessonId: c4l3.id, text: "What is 'continuous movement' in VR?", options: JSON.stringify(["Smooth joystick-based locomotion", "Teleportation", "Room-scale walking", "Auto-pilot"]), answer: "Smooth joystick-based locomotion", order: 4 },
      { lessonId: c4l3.id, text: "What does 'teleportation' help prevent?", options: JSON.stringify(["Motion sickness", "Low frame rates", "Battery drain", "Tracking loss"]), answer: "Motion sickness", order: 5 },
      { lessonId: c4l3.id, text: "What is the XR Ray Interactor used for?", options: JSON.stringify(["Pointing and selecting distant objects", "Grabbing nearby objects", "Walking", "Jumping"]), answer: "Pointing and selecting distant objects", order: 6 },
      { lessonId: c4l3.id, text: "What is 'haptic feedback' in XR interactions?", options: JSON.stringify(["Controller vibrations on interaction", "Audio feedback", "Visual effects", "Screen shake"]), answer: "Controller vibrations on interaction", order: 7 },
      { lessonId: c4l3.id, text: "What does the XR Poke Interactor handle?", options: JSON.stringify(["Button pressing with fingers", "Grabbing objects", "Teleportation", "Rotation"]), answer: "Button pressing with fingers", order: 8 },
      { lessonId: c4l3.id, text: "What is a 'teleportation anchor'?", options: JSON.stringify(["A specific destination point for teleport", "A type of object", "A UI element", "A light source"]), answer: "A specific destination point for teleport", order: 9 },
      { lessonId: c4l3.id, text: "What does 'throw behavior' do on grabbable objects?", options: JSON.stringify(["Preserves momentum when released", "Destroys the object", "Respawns the object", "Freezes the object"]), answer: "Preserves momentum when released", order: 10 },
      { lessonId: c4l4.id, text: "How do you detect collisions in VR?", options: JSON.stringify(["Using Unity colliders and triggers", "Raycasting only", "Manual distance checks", "Visual detection"]), answer: "Using Unity colliders and triggers", order: 1 },
      { lessonId: c4l4.id, text: "What is a 'spawner' in VR games?", options: JSON.stringify(["An object that creates other objects", "A type of enemy", "A UI button", "A checkpoint"]), answer: "An object that creates other objects", order: 2 },
      { lessonId: c4l4.id, text: "How do you track score in VR?", options: JSON.stringify(["Using a GameManager script with variables", "Manual counting", "Visual inspection", "External tools"]), answer: "Using a GameManager script with variables", order: 3 },
      { lessonId: c4l4.id, text: "What is 'wave spawning'?", options: JSON.stringify(["Spawning enemies in timed groups", "Spawning all at once", "Continuous spawning", "Manual placement"]), answer: "Spawning enemies in timed groups", order: 4 },
      { lessonId: c4l4.id, text: "How do you display UI in VR?", options: JSON.stringify(["World space canvas with XR UI interactors", "Screen space overlay", "Direct texture drawing", "External monitor"]), answer: "World space canvas with XR UI interactors", order: 5 },
      { lessonId: c4l4.id, text: "What is a 'timer' component in Unity?", options: JSON.stringify(["Counts down or up for game events", "Measures FPS", "Tracks loading time", "Monitors battery"]), answer: "Counts down or up for game events", order: 6 },
      { lessonId: c4l4.id, text: "How do you handle game over in VR?", options: JSON.stringify(["Show a world space menu with options", "Close the application", "Restart the headset", "Load a 2D screen"]), answer: "Show a world space menu with options", order: 7 },
      { lessonId: c4l4.id, text: "What is 'object pooling' used for?", options: JSON.stringify(["Reusing objects to improve performance", "Creating new objects", "Deleting objects", "Sorting objects"]), answer: "Reusing objects to improve performance", order: 8 },
      { lessonId: c4l4.id, text: "How do you implement player health in VR?", options: JSON.stringify(["Using a script with health variable and UI", "Hardware monitoring", "External health tracker", "Visual only"]), answer: "Using a script with health variable and UI", order: 9 },
      { lessonId: c4l4.id, text: "What is 'difficulty scaling' in VR games?", options: JSON.stringify(["Adjusting game parameters based on skill", "Changing graphics quality", "Audio volume", "Controller sensitivity"]), answer: "Adjusting game parameters based on skill", order: 10 },
    ],
  });

  // ── Course 5: VR for Architecture and Design ──
  const course5 = await prisma.course.upsert({
    where: { id: "course-vr-architecture" },
    update: {},
    create: {
      id: "course-vr-architecture",
      title: "VR for Architecture and Design",
      description: "Use VR for architectural visualization, interior design, and spatial planning. Learn to create immersive walkthroughs and design reviews.",
      instructorId: instructor.id,
      published: true,
      category: "Design",
      difficulty: "Intermediate",
      estimatedHours: 25,
    },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course5.id, tag: "Architecture" } },
    update: {},
    create: { courseId: course5.id, tag: "Architecture" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course5.id, tag: "Visualization" } },
    update: {},
    create: { courseId: course5.id, tag: "Visualization" },
  });

  const c5m1 = await prisma.module.create({
    data: { title: "Architectural Visualization", description: "Create 3D architectural models and prepare them for VR", order: 1, courseId: course5.id },
  });
  const c5m2 = await prisma.module.create({
    data: { title: "VR Design Review", description: "Conduct design reviews and presentations in VR", order: 2, courseId: course5.id },
  });

  const c5l1 = await prisma.lesson.create({
    data: { title: "3D Modeling for Architecture", description: "Create architectural models optimized for real-time VR walkthroughs.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=iEF-4AvmPJg", duration: 900, moduleId: c5m1.id },
  });
  const c5l2 = await prisma.lesson.create({
    data: { title: "Lighting and Materials for ArchViz", description: "Create realistic lighting and material setups for architectural visualization in VR.", type: "ARTICLE", order: 2, duration: 650, moduleId: c5m1.id },
  });
  const c5l3 = await prisma.lesson.create({
    data: { title: "Creating VR Walkthroughs", description: "Build immersive walkthrough experiences for architectural presentations in VR.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=nV_hd6bLXmw", duration: 850, moduleId: c5m2.id },
  });
  const c5l4 = await prisma.lesson.create({
    data: { title: "Design Collaboration in VR", description: "Use multi-user VR tools for collaborative design review and client presentations.", type: "ARTICLE", order: 2, duration: 550, moduleId: c5m2.id },
  });

  await prisma.question.createMany({
    data: [
      { lessonId: c5l1.id, text: "Why is 3D modeling important for architectural VR?", options: JSON.stringify(["Creates immersive walkthroughs", "Replaces blueprints", "Automates design", "Reduces costs"]), answer: "Creates immersive walkthroughs", order: 1 },
      { lessonId: c5l1.id, text: "What software is commonly used for architectural 3D modeling?", options: JSON.stringify(["Blender, SketchUp, Revit", "Photoshop", "Chrome", "Excel"]), answer: "Blender, SketchUp, Revit", order: 2 },
      { lessonId: c5l1.id, text: "What is 'scale accuracy' in architectural VR?", options: JSON.stringify(["Models match real-world measurements", "Models look good", "Models are small", "Models are colorful"]), answer: "Models match real-world measurements", order: 3 },
      { lessonId: c5l1.id, text: "What file format is best for architectural VR assets?", options: JSON.stringify(["FBX or glTF", "JPEG", "MP3", "DOCX"]), answer: "FBX or glTF", order: 4 },
      { lessonId: c5l1.id, text: "What is 'polygon budget' for architectural VR?", options: JSON.stringify(["Maximum polygons for smooth performance", "Cost of modeling", "File size limit", "Render time"]), answer: "Maximum polygons for smooth performance", order: 5 },
      { lessonId: c5l1.id, text: "What is 'LOD' used for in architectural VR?", options: JSON.stringify(["Reducing detail at a distance", "Adding more detail", "Changing colors", "Modifying lighting"]), answer: "Reducing detail at a distance", order: 6 },
      { lessonId: c5l1.id, text: "Why is 'collision' important in VR walkthroughs?", options: JSON.stringify(["Prevents walking through walls", "Enables physics", "Improves graphics", "Reduces lag"]), answer: "Prevents walking through walls", order: 7 },
      { lessonId: c5l1.id, text: "What is a 'skybox' in architectural VR?", options: JSON.stringify(["A 360-degree environment background", "A type of roof", "A lighting technique", "A texture map"]), answer: "A 360-degree environment background", order: 8 },
      { lessonId: c5l1.id, text: "What does 'real-world scale' mean in VR?", options: JSON.stringify(["1 meter in 3D equals 1 meter in real life", "Objects look bigger", "Objects look smaller", "No scaling applied"]), answer: "1 meter in 3D equals 1 meter in real life", order: 9 },
      { lessonId: c5l1.id, text: "What is 'interior visualization' in VR?", options: JSON.stringify(["Exploring indoor spaces in virtual reality", "Exterior design only", "Blueprint reading", "Structural engineering"]), answer: "Exploring indoor spaces in virtual reality", order: 10 },
      { lessonId: c5l2.id, text: "What is 'baked lighting' in ArchViz?", options: JSON.stringify(["Pre-computed lighting for better performance", "Real-time dynamic lights", "Natural sunlight", "Artificial lights"]), answer: "Pre-computed lighting for better performance", order: 1 },
      { lessonId: c5l2.id, text: "What is a 'PBR material' in architectural VR?", options: JSON.stringify(["Physically based rendering material", "A type of paint", "A 3D model", "A lighting setup"]), answer: "Physically based rendering material", order: 2 },
      { lessonId: c5l2.id, text: "What does 'roughness' control in ArchViz materials?", options: JSON.stringify(["How glossy a surface appears", "The color intensity", "The transparency", "The height"]), answer: "How glossy a surface appears", order: 3 },
      { lessonId: c5l2.id, text: "What is 'HDRI' in architectural VR?", options: JSON.stringify(["High dynamic range image for lighting", "A 3D model format", "A rendering technique", "A file compression"]), answer: "High dynamic range image for lighting", order: 4 },
      { lessonId: c5l2.id, text: "What is 'ambient occlusion' used for?", options: JSON.stringify(["Adding shadows in corners and crevices", "Increasing brightness", "Changing colors", "Adding reflections"]), answer: "Adding shadows in corners and crevices", order: 5 },
      { lessonId: c5l2.id, text: "What is 'texture resolution' for VR?", options: JSON.stringify(["The pixel dimensions of a texture map", "The file size", "The color depth", "The compression ratio"]), answer: "The pixel dimensions of a texture map", order: 6 },
      { lessonId: c5l2.id, text: "What is 'UV mapping' used for in ArchViz?", options: JSON.stringify(["Applying textures to 3D models", "Creating 3D geometry", "Rendering scenes", "Animating objects"]), answer: "Applying textures to 3D models", order: 7 },
      { lessonId: c5l2.id, text: "What is 'normal mapping' in architectural VR?", options: JSON.stringify(["Simulating surface detail without geometry", "Adding polygons", "Creating 3D models", "Rendering shadows"]), answer: "Simulating surface detail without geometry", order: 8 },
      { lessonId: c5l2.id, text: "What is 'real-time rendering' in VR?", options: JSON.stringify(["Rendering frames as the user moves", "Pre-rendered videos", "Still images", "Offline rendering"]), answer: "Rendering frames as the user moves", order: 9 },
      { lessonId: c5l2.id, text: "What is 'color temperature' in VR lighting?", options: JSON.stringify(["Warm or cool tone of light", "Light intensity", "Light position", "Light color saturation"]), answer: "Warm or cool tone of light", order: 10 },
      { lessonId: c5l3.id, text: "What is a 'VR walkthrough'?", options: JSON.stringify(["Navigating a 3D building in VR", "A video tour", "A 2D slideshow", "A blueprint review"]), answer: "Navigating a 3D building in VR", order: 1 },
      { lessonId: c5l3.id, text: "What locomotion method is common for VR walkthroughs?", options: JSON.stringify(["Teleportation and smooth movement", "Driving", "Flying", "Jumping"]), answer: "Teleportation and smooth movement", order: 2 },
      { lessonId: c5l3.id, text: "What is 'eye height' in VR walkthroughs?", options: JSON.stringify(["The camera height matching real human height", "The ceiling height", "The object height", "The room height"]), answer: "The camera height matching real human height", order: 3 },
      { lessonId: c5l3.id, text: "How do you mark up designs in VR?", options: JSON.stringify(["Using VR annotation and drawing tools", "Using pen and paper", "Taking screenshots", "Voice recording"]), answer: "Using VR annotation and drawing tools", order: 4 },
      { lessonId: c5l3.id, text: "What is 'spatial audio' in VR walkthroughs?", options: JSON.stringify(["3D sound that changes with position", "Mono audio", "Stereo music", "Silent walkthroughs"]), answer: "3D sound that changes with position", order: 5 },
      { lessonId: c5l3.id, text: "What is 'wayfinding' in VR architecture?", options: JSON.stringify(["Guiding users through a virtual space", "Creating floor plans", "Measuring distances", "Selecting materials"]), answer: "Guiding users through a virtual space", order: 6 },
      { lessonId: c5l3.id, text: "How do you present design options in VR?", options: JSON.stringify(["Switching between different scenes or layers", "Showing 2D images", "Playing videos", "Reading descriptions"]), answer: "Switching between different scenes or layers", order: 7 },
      { lessonId: c5l3.id, text: "What is 'daylight simulation' in VR?", options: JSON.stringify(["Showing how sunlight moves through a space", "Nighttime rendering", "Artificial lighting only", "No lighting"]), answer: "Showing how sunlight moves through a space", order: 8 },
      { lessonId: c5l3.id, text: "What is 'multi-floor navigation' in VR?", options: JSON.stringify(["Moving between different levels of a building", "Single floor only", "External views only", "Underground views"]), answer: "Moving between different levels of a building", order: 9 },
      { lessonId: c5l3.id, text: "What is 'real-time material swapping'?", options: JSON.stringify(["Changing materials during a VR session", "Pre-rendered materials", "Static textures", "No material changes"]), answer: "Changing materials during a VR session", order: 10 },
      { lessonId: c5l4.id, text: "What is 'collaborative design review' in VR?", options: JSON.stringify(["Multiple people reviewing a design together in VR", "Email review", "In-person meeting", "Phone call"]), answer: "Multiple people reviewing a design together in VR", order: 1 },
      { lessonId: c5l4.id, text: "What is a 'multi-user VR session'?", options: JSON.stringify(["Multiple users in the same virtual space", "Single player mode", "Split-screen", "Network test"]), answer: "Multiple users in the same virtual space", order: 2 },
      { lessonId: c5l4.id, text: "How do clients interact in VR design review?", options: JSON.stringify(["Navigating and pointing at elements", "Only watching", "Editing models", "Writing code"]), answer: "Navigating and pointing at elements", order: 3 },
      { lessonId: c5l4.id, text: "What is 'avatar representation' in VR?", options: JSON.stringify(["A digital body representing each user", "A profile picture", "A username", "An email"]), answer: "A digital body representing each user", order: 4 },
      { lessonId: c5l4.id, text: "What is 'design iteration' in VR?", options: JSON.stringify(["Making changes based on VR review feedback", "Starting from scratch", "Ignoring feedback", "Finalizing design"]), answer: "Making changes based on VR review feedback", order: 5 },
      { lessonId: c5l4.id, text: "How do you record feedback in VR?", options: JSON.stringify(["Voice recording, annotations, and screenshots", "Email only", "Paper notes", "Spreadsheets"]), answer: "Voice recording, annotations, and screenshots", order: 6 },
      { lessonId: c5l4.id, text: "What is 'version comparison' in VR?", options: JSON.stringify(["Viewing different design versions side by side", "Single version only", "Text comparison", "Manual review"]), answer: "Viewing different design versions side by side", order: 7 },
      { lessonId: c5l4.id, text: "What is 'measurement tool' in VR?", options: JSON.stringify(["Measuring distances in virtual space", "A physical ruler", "A 3D printer", "A camera"]), answer: "Measuring distances in virtual space", order: 8 },
      { lessonId: c5l4.id, text: "What is 'cross-platform VR' for design?", options: JSON.stringify(["VR sessions on different headset types", "Only PC VR", "Only mobile VR", "Only console VR"]), answer: "VR sessions on different headset types", order: 9 },
      { lessonId: c5l4.id, text: "What is the main benefit of VR design review?", options: JSON.stringify(["Understanding scale and space intuitively", "Faster rendering", "Lower cost", "Better colors"]), answer: "Understanding scale and space intuitively", order: 10 },
    ],
  });

  // ── Course 6: Immersive Storytelling ──
  const course6 = await prisma.course.upsert({
    where: { id: "course-immersive-storytelling" },
    update: {},
    create: {
      id: "course-immersive-storytelling",
      title: "Immersive Storytelling",
      description: "Learn to craft compelling narratives and interactive stories for VR. Cover branching narratives, spatial storytelling, and emotional engagement.",
      instructorId: instructor.id,
      published: true,
      category: "Art",
      difficulty: "Beginner",
      estimatedHours: 20,
    },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course6.id, tag: "Storytelling" } },
    update: {},
    create: { courseId: course6.id, tag: "Storytelling" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course6.id, tag: "Narrative" } },
    update: {},
    create: { courseId: course6.id, tag: "Narrative" },
  });

  const c6m1 = await prisma.module.create({
    data: { title: "Narrative Fundamentals", description: "Understand storytelling principles adapted for immersive VR experiences", order: 1, courseId: course6.id },
  });
  const c6m2 = await prisma.module.create({
    data: { title: "Storytelling Techniques", description: "Implement interactive and branching narratives in VR", order: 2, courseId: course6.id },
  });

  const c6l1 = await prisma.lesson.create({
    data: { title: "Storytelling in VR vs Traditional Media", description: "How VR changes narrative structure, pacing, and audience engagement compared to film and books.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=i6fCFnmGtv8", duration: 750, moduleId: c6m1.id },
  });
  const c6l2 = await prisma.lesson.create({
    data: { title: "Building Narrative Worlds", description: "Design virtual environments that tell stories through their layout, objects, and atmosphere.", type: "ARTICLE", order: 2, duration: 600, moduleId: c6m1.id },
  });
  const c6l3 = await prisma.lesson.create({
    data: { title: "Interactive Story Branches", description: "Create branching storylines where user choices affect the narrative outcome.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=OKz7-OTD5So", duration: 900, moduleId: c6m2.id },
  });
  const c6l4 = await prisma.lesson.create({
    data: { title: "Emotional Engagement in VR", description: "Techniques for creating emotional connections through presence, character interaction, and immersive audio.", type: "ARTICLE", order: 2, duration: 500, moduleId: c6m2.id },
  });

  await prisma.question.createMany({
    data: [
      { lessonId: c6l1.id, text: "How does VR storytelling differ from film?", options: JSON.stringify(["VR is interactive and non-linear", "VR is the same as film", "VR has no story", "VR is only for games"]), answer: "VR is interactive and non-linear", order: 1 },
      { lessonId: c6l1.id, text: "What is 'agency' in VR storytelling?", options: JSON.stringify(["The user's ability to influence the story", "The narrator's role", "The character's motivation", "The plot structure"]), answer: "The user's ability to influence the story", order: 2 },
      { lessonId: c6l1.id, text: "What is 'spatial storytelling'?", options: JSON.stringify(["Telling stories through the environment", "Dialogue-based storytelling", "Text-based narrative", "Audio-only narrative"]), answer: "Telling stories through the environment", order: 3 },
      { lessonId: c6l1.id, text: "What is 'presence' in VR narrative?", options: JSON.stringify(["Feeling like you are inside the story", "Being physically present", "Having a VR headset", "Internet connection"]), answer: "Feeling like you are inside the story", order: 4 },
      { lessonId: c6l1.id, text: "What is 'diegetic storytelling'?", options: JSON.stringify(["Story elements that exist within the VR world", "Voice-over narration", "Text on screen", "Menu screens"]), answer: "Story elements that exist within the VR world", order: 5 },
      { lessonId: c6l1.id, text: "How does pacing work in VR stories?", options: JSON.stringify(["User-driven pacing through exploration", "Fixed timing like film", "Only fast-paced action", "No pacing needed"]), answer: "User-driven pacing through exploration", order: 6 },
      { lessonId: c6l1.id, text: "What is 'environmental storytelling'?", options: JSON.stringify(["Objects and spaces that reveal story", "Dialogue between characters", "Text documents", "Cutscenes"]), answer: "Objects and spaces that reveal story", order: 7 },
      { lessonId: c6l1.id, text: "What is 'character embodiment' in VR?", options: JSON.stringify(["Becoming a character in the story", "Watching a character", "Reading about a character", "Drawing a character"]), answer: "Becoming a character in the story", order: 8 },
      { lessonId: c6l1.id, text: "What is 'guided narrative' in VR?", options: JSON.stringify(["Subtle cues that direct user attention", "Forced path walking", "Cutscenes", "Loading screens"]), answer: "Subtle cues that direct user attention", order: 9 },
      { lessonId: c6l1.id, text: "What is 'non-linear narrative'?", options: JSON.stringify(["Story that can be experienced in different orders", "Linear timeline", "Reverse chronology", "Single path"]), answer: "Story that can be experienced in different orders", order: 10 },
      { lessonId: c6l2.id, text: "What is 'world-building' in VR?", options: JSON.stringify(["Creating the environment and lore of a story", "Constructing buildings", "Designing levels", "Writing dialogue"]), answer: "Creating the environment and lore of a story", order: 1 },
      { lessonId: c6l2.id, text: "What is 'atmosphere' in VR worlds?", options: JSON.stringify(["The mood created by lighting, sound, and design", "The air quality", "The weather system", "The room temperature"]), answer: "The mood created by lighting, sound, and design", order: 2 },
      { lessonId: c6l2.id, text: "What is 'environmental detail' in VR?", options: JSON.stringify(["Small objects that make worlds feel real", "Large structures only", "Empty spaces", "Flat textures"]), answer: "Small objects that make worlds feel real", order: 3 },
      { lessonId: c6l2.id, text: "What is 'cohesive design' in storytelling?", options: JSON.stringify(["All elements support the same story theme", "Random design choices", "Mixed styles", "Generic assets"]), answer: "All elements support the same story theme", order: 4 },
      { lessonId: c6l2.id, text: "What is 'color palette' in VR storytelling?", options: JSON.stringify(["Colors chosen to convey mood and emotion", "Random colors", "Only grayscale", "Only bright colors"]), answer: "Colors chosen to convey mood and emotion", order: 5 },
      { lessonId: c6l2.id, text: "What is 'audio storytelling' in VR?", options: JSON.stringify(["Using spatial audio to enhance narrative", "Silent environments", "Only background music", "Voice acting only"]), answer: "Using spatial audio to enhance narrative", order: 6 },
      { lessonId: c6l2.id, text: "What is 'lighting for mood' in VR?", options: JSON.stringify(["Using light color and intensity to set tone", "Maximum brightness", "No lighting", "Only directional light"]), answer: "Using light color and intensity to set tone", order: 7 },
      { lessonId: c6l2.id, text: "What is 'scale' in world-building?", options: JSON.stringify(["The size of objects relative to the player", "The map size", "The polygon count", "The file size"]), answer: "The size of objects relative to the player", order: 8 },
      { lessonId: c6l2.id, text: "What is 'interactive objects' in storytelling?", options: JSON.stringify(["Objects the user can examine or use to learn story", "Static background objects", "Invisible objects", "Only characters"]), answer: "Objects the user can examine or use to learn story", order: 9 },
      { lessonId: c6l2.id, text: "What is 'spatial consistency'?", options: JSON.stringify(["The world follows logical spatial rules", "Random object placement", "Teleporting objects", "Inconsistent geometry"]), answer: "The world follows logical spatial rules", order: 10 },
      { lessonId: c6l3.id, text: "What is a 'branching narrative'?", options: JSON.stringify(["A story with multiple paths based on choices", "A single linear story", "A circular story", "No story at all"]), answer: "A story with multiple paths based on choices", order: 1 },
      { lessonId: c6l3.id, text: "What is a 'choice point' in interactive stories?", options: JSON.stringify(["A moment where the user makes a decision", "The start of the story", "The end of the story", "A loading screen"]), answer: "A moment where the user makes a decision", order: 2 },
      { lessonId: c6l3.id, text: "What is 'consequence' in branching narratives?", options: JSON.stringify(["The result of a user's choice", "A random event", "The story ending", "A character introduction"]), answer: "The result of a user's choice", order: 3 },
      { lessonId: c6l3.id, text: "What is a 'narrative graph'?", options: JSON.stringify(["A map of all story branches and connections", "A character list", "A timeline", "A dialogue script"]), answer: "A map of all story branches and connections", order: 4 },
      { lessonId: c6l3.id, text: "What is 'replayability' in branching stories?", options: JSON.stringify(["Incentive to experience different paths", "Playing once", "No choices", "Single ending"]), answer: "Incentive to experience different paths", order: 5 },
      { lessonId: c6l3.id, text: "What is 'meaningful choice'?", options: JSON.stringify(["A choice with noticeable impact on the story", "A cosmetic choice", "A false choice", "An automatic choice"]), answer: "A choice with noticeable impact on the story", order: 6 },
      { lessonId: c6l3.id, text: "What is 'illusion of choice'?", options: JSON.stringify(["Choices that lead to the same outcome", "Multiple unique outcomes", "No choices given", "Random outcomes"]), answer: "Choices that lead to the same outcome", order: 7 },
      { lessonId: c6l3.id, text: "How do you track story state in VR?", options: JSON.stringify(["Using variables and flags in a story manager", "Manual notes", "Player memory", "Random selection"]), answer: "Using variables and flags in a story manager", order: 8 },
      { lessonId: c6l3.id, text: "What is a 'dialogue tree'?", options: JSON.stringify(["Branching conversation options for the user", "A single dialogue line", "A character list", "A script file"]), answer: "Branching conversation options for the user", order: 9 },
      { lessonId: c6l3.id, text: "What is 'narrative closure'?", options: JSON.stringify(["Satisfying endings for each story branch", "An open ending", "No ending", "A cliffhanger"]), answer: "Satisfying endings for each story branch", order: 10 },
      { lessonId: c6l4.id, text: "What creates emotional engagement in VR?", options: JSON.stringify(["Presence, character connection, and immersive audio", "Only graphics", "Only gameplay", "Only story text"]), answer: "Presence, character connection, and immersive audio", order: 1 },
      { lessonId: c6l4.id, text: "What is 'character empathy' in VR?", options: JSON.stringify(["Feeling connected to virtual characters", "Disliking characters", "Ignoring characters", "Copying characters"]), answer: "Feeling connected to virtual characters", order: 2 },
      { lessonId: c6l4.id, text: "How does eye contact work in VR?", options: JSON.stringify(["Characters looking at the user creates connection", "No eye contact possible", "Only text dialogue", "Audio only"]), answer: "Characters looking at the user creates connection", order: 3 },
      { lessonId: c6l4.id, text: "What is 'emotional pacing'?", options: JSON.stringify(["Alternating tense and calm moments", "Constant action", "No emotional variation", "Only calm moments"]), answer: "Alternating tense and calm moments", order: 4 },
      { lessonId: c6l4.id, text: "What is 'immersive audio' for emotion?", options: JSON.stringify(["Spatial sound that creates atmosphere", "Loud noises only", "Silence", "Background music only"]), answer: "Spatial sound that creates atmosphere", order: 5 },
      { lessonId: c6l4.id, text: "What is 'personalization' in VR stories?", options: JSON.stringify(["Tailoring story elements to the user", "Generic story", "Fixed characters", "No user input"]), answer: "Tailoring story elements to the user", order: 6 },
      { lessonId: c6l4.id, text: "What is 'physical interaction' for emotion?", options: JSON.stringify(["Touching virtual objects creates connection", "No physical interaction", "Only button presses", "Voice only"]), answer: "Touching virtual objects creates connection", order: 7 },
      { lessonId: c6l4.id, text: "What is 'facial expression' in VR characters?", options: JSON.stringify(["Animated faces that convey emotion", "Static masks", "No faces", "Text only"]), answer: "Animated faces that convey emotion", order: 8 },
      { lessonId: c6l4.id, text: "What is 'emotional memory' in VR?", options: JSON.stringify(["Previous story events affecting emotional response", "No memory", "Random emotions", "Flat emotions"]), answer: "Previous story events affecting emotional response", order: 9 },
      { lessonId: c6l4.id, text: "What is 'catharsis' in VR storytelling?", options: JSON.stringify(["Emotional release through story resolution", "Emotional buildup", "No resolution", "Constant tension"]), answer: "Emotional release through story resolution", order: 10 },
    ],
  });

  // ── Course 7: VR Project Management ──
  const course7 = await prisma.course.upsert({
    where: { id: "course-vr-project-management" },
    update: {},
    create: {
      id: "course-vr-project-management",
      title: "VR Project Management",
      description: "Manage VR development projects from concept to delivery. Cover agile methodologies, team coordination, milestone planning, and quality assurance.",
      instructorId: instructor.id,
      published: true,
      category: "Business",
      difficulty: "Beginner",
      estimatedHours: 15,
    },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course7.id, tag: "Management" } },
    update: {},
    create: { courseId: course7.id, tag: "Management" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course7.id, tag: "Business" } },
    update: {},
    create: { courseId: course7.id, tag: "Business" },
  });

  const c7m1 = await prisma.module.create({
    data: { title: "Planning VR Projects", description: "Scope, plan, and budget VR development projects effectively", order: 1, courseId: course7.id },
  });
  const c7m2 = await prisma.module.create({
    data: { title: "Team and Workflow", description: "Build and manage cross-functional VR development teams", order: 2, courseId: course7.id },
  });

  const c7l1 = await prisma.lesson.create({
    data: { title: "VR Project Scoping", description: "Define project scope, requirements, and deliverables for VR applications.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=akFB5YYkcbo", duration: 650, moduleId: c7m1.id },
  });
  const c7l2 = await prisma.lesson.create({
    data: { title: "Budgeting and Timeline", description: "Estimate costs, allocate resources, and create realistic timelines for VR projects.", type: "ARTICLE", order: 2, duration: 550, moduleId: c7m1.id },
  });
  const c7l3 = await prisma.lesson.create({
    data: { title: "Agile VR Development", description: "Apply agile and scrum methodologies specifically to VR development workflows.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=qIcZlHFqzAQ", duration: 700, moduleId: c7m2.id },
  });
  const c7l4 = await prisma.lesson.create({
    data: { title: "Quality Assurance for VR", description: "Test VR applications for performance, comfort, and usability across different hardware.", type: "ARTICLE", order: 2, duration: 600, moduleId: c7m2.id },
  });

  await prisma.question.createMany({
    data: [
      { lessonId: c7l1.id, text: "What is the first step in VR project planning?", options: JSON.stringify(["Define project scope and goals", "Start coding", "Buy hardware", "Hire a team"]), answer: "Define project scope and goals", order: 1 },
      { lessonId: c7l1.id, text: "What is a 'project charter'?", options: JSON.stringify(["A document defining project objectives and stakeholders", "A contract", "A budget sheet", "A timeline"]), answer: "A document defining project objectives and stakeholders", order: 2 },
      { lessonId: c7l1.id, text: "What is 'feasibility study' in VR?", options: JSON.stringify(["Assessing if the project is technically possible", "Building a prototype", "Testing the app", "Marketing research"]), answer: "Assessing if the project is technically possible", order: 3 },
      { lessonId: c7l1.id, text: "What is 'target platform' in VR?", options: JSON.stringify(["Which VR headset the project targets", "A marketing platform", "A development tool", "A file format"]), answer: "Which VR headset the project targets", order: 4 },
      { lessonId: c7l1.id, text: "What is a 'technical requirement'?", options: JSON.stringify(["Hardware and software needed for the project", "A design choice", "A budget item", "A marketing goal"]), answer: "Hardware and software needed for the project", order: 5 },
      { lessonId: c7l1.id, text: "What is 'scope creep'?", options: JSON.stringify(["Uncontrolled expansion of project requirements", "Reducing scope", "Meeting deadlines", "Staying on budget"]), answer: "Uncontrolled expansion of project requirements", order: 6 },
      { lessonId: c7l1.id, text: "What is 'minimum viable product' (MVP) in VR?", options: JSON.stringify(["The smallest usable version of the VR app", "The final product", "The design document", "The marketing plan"]), answer: "The smallest usable version of the VR app", order: 7 },
      { lessonId: c7l1.id, text: "What is 'risk assessment' in VR projects?", options: JSON.stringify(["Identifying potential problems and mitigations", "Testing the app", "Hiring staff", "Setting a budget"]), answer: "Identifying potential problems and mitigations", order: 8 },
      { lessonId: c7l1.id, text: "What is a 'project stakeholder'?", options: JSON.stringify(["Anyone with interest in the project outcome", "Only the developer", "Only the client", "Only the end user"]), answer: "Anyone with interest in the project outcome", order: 9 },
      { lessonId: c7l1.id, text: "What is 'deliverable' in VR projects?", options: JSON.stringify(["A tangible output of the project", "A meeting", "A document", "A tool"]), answer: "A tangible output of the project", order: 10 },
      { lessonId: c7l2.id, text: "What is 'resource allocation'?", options: JSON.stringify(["Assigning team members to tasks", "Buying equipment", "Renting office space", "Creating a schedule"]), answer: "Assigning team members to tasks", order: 1 },
      { lessonId: c7l2.id, text: "What is a 'Gantt chart' used for?", options: JSON.stringify(["Visualizing project timeline and dependencies", "Tracking bugs", "Designing UI", "Writing code"]), answer: "Visualizing project timeline and dependencies", order: 2 },
      { lessonId: c7l2.id, text: "What is 'contingency budget'?", options: JSON.stringify(["Extra funds for unexpected issues", "The main budget", "Revenue", "Profit margin"]), answer: "Extra funds for unexpected issues", order: 3 },
      { lessonId: c7l2.id, text: "What is 'milestone' in project management?", options: JSON.stringify(["A significant checkpoint in the project", "The final deadline", "A daily standup", "A code review"]), answer: "A significant checkpoint in the project", order: 4 },
      { lessonId: c7l2.id, text: "What is 'time estimation' in VR?", options: JSON.stringify(["Predicting how long tasks will take", "Counting work hours", "Measuring render time", "Tracking frame rate"]), answer: "Predicting how long tasks will take", order: 5 },
      { lessonId: c7l2.id, text: "What is 'cost estimation'?", options: JSON.stringify(["Predicting total project costs", "Setting a sale price", "Calculating profit", "Tracking expenses"]), answer: "Predicting total project costs", order: 6 },
      { lessonId: c7l2.id, text: "What is 'return on investment' (ROI) for VR?", options: JSON.stringify(["The value gained from the VR project", "The project cost", "The development time", "The team size"]), answer: "The value gained from the VR project", order: 7 },
      { lessonId: c7l2.id, text: "What is 'budget tracking'?", options: JSON.stringify(["Monitoring actual spending vs budget", "Setting a budget", "Saving money", "Making profit"]), answer: "Monitoring actual spending vs budget", order: 8 },
      { lessonId: c7l2.id, text: "What is 'resource leveling'?", options: JSON.stringify(["Balancing workload across the team", "Increasing resources", "Decreasing staff", "Hiring more people"]), answer: "Balancing workload across the team", order: 9 },
      { lessonId: c7l2.id, text: "What is 'project buffer'?", options: JSON.stringify(["Extra time added to account for delays", "The main timeline", "A fast track", "A milestone"]), answer: "Extra time added to account for delays", order: 10 },
      { lessonId: c7l3.id, text: "What is 'sprint' in agile VR development?", options: JSON.stringify(["A fixed time period for completing tasks", "A race", "A quick meeting", "A code review"]), answer: "A fixed time period for completing tasks", order: 1 },
      { lessonId: c7l3.id, text: "What is 'scrum' methodology?", options: JSON.stringify(["An agile framework with roles and ceremonies", "A coding standard", "A design pattern", "A testing tool"]), answer: "An agile framework with roles and ceremonies", order: 2 },
      { lessonId: c7l3.id, text: "What is 'daily standup'?", options: JSON.stringify(["A brief daily team meeting", "A weekly review", "A monthly report", "A yearly planning"]), answer: "A brief daily team meeting", order: 3 },
      { lessonId: c7l3.id, text: "What is a 'product backlog'?", options: JSON.stringify(["A prioritized list of tasks and features", "A completed project", "A bug list", "A design document"]), answer: "A prioritized list of tasks and features", order: 4 },
      { lessonId: c7l3.id, text: "What is 'sprint retrospective'?", options: JSON.stringify(["A meeting to review what went well and improve", "A planning session", "A coding session", "A testing session"]), answer: "A meeting to review what went well and improve", order: 5 },
      { lessonId: c7l3.id, text: "What is 'velocity' in agile?", options: JSON.stringify(["How much work a team completes per sprint", "Development speed", "Frame rate", "Loading time"]), answer: "How much work a team completes per sprint", order: 6 },
      { lessonId: c7l3.id, text: "What is 'user story'?", options: JSON.stringify(["A feature described from user perspective", "A novel", "A character backstory", "A plot summary"]), answer: "A feature described from user perspective", order: 7 },
      { lessonId: c7l3.id, text: "What is 'sprint planning'?", options: JSON.stringify(["Selecting backlog items for the next sprint", "Yearly planning", "Daily tasks", "Monthly review"]), answer: "Selecting backlog items for the next sprint", order: 8 },
      { lessonId: c7l3.id, text: "What is 'definition of done'?", options: JSON.stringify(["Criteria for completing a task", "The end of the project", "A deadline", "A milestone"]), answer: "Criteria for completing a task", order: 9 },
      { lessonId: c7l3.id, text: "What is 'agile manifesto'?", options: JSON.stringify(["Values and principles for agile development", "A project plan", "A coding guide", "A design system"]), answer: "Values and principles for agile development", order: 10 },
      { lessonId: c7l4.id, text: "What is 'VR quality assurance'?", options: JSON.stringify(["Testing VR apps for performance and comfort", "Writing code", "Designing assets", "Marketing"]), answer: "Testing VR apps for performance and comfort", order: 1 },
      { lessonId: c7l4.id, text: "What is 'frame rate testing' in VR?", options: JSON.stringify(["Ensuring consistent 90 FPS for comfort", "Testing internet speed", "Checking battery life", "Measuring screen size"]), answer: "Ensuring consistent 90 FPS for comfort", order: 2 },
      { lessonId: c7l4.id, text: "What is 'motion sickness testing'?", options: JSON.stringify(["Testing if the app causes discomfort", "Testing movement speed", "Testing controller input", "Testing audio"]), answer: "Testing if the app causes discomfort", order: 3 },
      { lessonId: c7l4.id, text: "What is 'regression testing'?", options: JSON.stringify(["Re-testing after changes to catch new bugs", "First-time testing", "Automated testing", "Manual testing only"]), answer: "Re-testing after changes to catch new bugs", order: 4 },
      { lessonId: c7l4.id, text: "What is 'user acceptance testing' (UAT)?", options: JSON.stringify(["End users test the final product", "Developer testing", "Automated testing", "Design review"]), answer: "End users test the final product", order: 5 },
      { lessonId: c7l4.id, text: "What is 'performance profiling' in VR?", options: JSON.stringify(["Analyzing CPU/GPU usage and frame times", "Testing internet speed", "Designing graphics", "Writing code"]), answer: "Analyzing CPU/GPU usage and frame times", order: 6 },
      { lessonId: c7l4.id, text: "What is 'bug tracking'?", options: JSON.stringify(["Recording and managing reported issues", "Fixing bugs", "Writing tests", "Code review"]), answer: "Recording and managing reported issues", order: 7 },
      { lessonId: c7l4.id, text: "What is 'cross-platform testing' in VR?", options: JSON.stringify(["Testing on different VR headset models", "Testing on one device", "Mobile testing only", "PC testing only"]), answer: "Testing on different VR headset models", order: 8 },
      { lessonId: c7l4.id, text: "What is 'comfort rating' in VR?", options: JSON.stringify(["A measure of how comfortable the VR experience is", "The headset weight", "The controller size", "The battery life"]), answer: "A measure of how comfortable the VR experience is", order: 9 },
      { lessonId: c7l4.id, text: "What is 'build verification'?", options: JSON.stringify(["Testing that the latest build is stable", "Creating a build", "Deploying the app", "Marketing the app"]), answer: "Testing that the latest build is stable", order: 10 },
    ],
  });

  // ── Course 8: Advanced VR Graphics and Rendering ──
  const course8 = await prisma.course.upsert({
    where: { id: "course-advanced-vr-graphics" },
    update: {},
    create: {
      id: "course-advanced-vr-graphics",
      title: "Advanced VR Graphics and Rendering",
      description: "Master high-performance rendering techniques for VR. Cover optimization, shader programming, post-processing, and advanced lighting for immersive experiences.",
      instructorId: instructor.id,
      published: true,
      category: "Technology",
      difficulty: "Advanced",
      estimatedHours: 30,
    },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course8.id, tag: "Graphics" } },
    update: {},
    create: { courseId: course8.id, tag: "Graphics" },
  });
  await prisma.courseTag.upsert({
    where: { courseId_tag: { courseId: course8.id, tag: "Advanced" } },
    update: {},
    create: { courseId: course8.id, tag: "Advanced" },
  });

  const c8m1 = await prisma.module.create({
    data: { title: "Rendering Techniques", description: "Understand VR rendering pipelines and advanced techniques", order: 1, courseId: course8.id },
  });
  const c8m2 = await prisma.module.create({
    data: { title: "Performance Optimization", description: "Optimize rendering performance for high-fidelity VR experiences", order: 2, courseId: course8.id },
  });

  const c8l1 = await prisma.lesson.create({
    data: { title: "VR Rendering Pipelines", description: "Learn how VR rendering differs from traditional rendering including stereo rendering and distortion correction.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=SAcHh9_ZG6A", duration: 850, moduleId: c8m1.id },
  });
  const c8l2 = await prisma.lesson.create({
    data: { title: "Shader Programming for VR", description: "Write custom shaders optimized for VR performance including vertex and fragment shaders.", type: "ARTICLE", order: 2, duration: 700, moduleId: c8m1.id },
  });
  const c8l3 = await prisma.lesson.create({
    data: { title: "Post-Processing in VR", description: "Apply post-processing effects like bloom, anti-aliasing, and color grading without compromising performance.", type: "VIDEO", order: 1, videoUrl: "https://www.youtube.com/watch?v=DvbzqSQ28qs", duration: 750, moduleId: c8m2.id },
  });
  const c8l4 = await prisma.lesson.create({
    data: { title: "Optimizing Draw Calls", description: "Reduce draw calls through batching, instancing, and occlusion culling for smooth VR performance.", type: "ARTICLE", order: 2, duration: 650, moduleId: c8m2.id },
  });

  await prisma.question.createMany({
    data: [
      { lessonId: c8l1.id, text: "How does VR rendering differ from standard rendering?", options: JSON.stringify(["It renders two viewpoints (stereo)", "It uses less power", "It is simpler", "It uses one camera"]), answer: "It renders two viewpoints (stereo)", order: 1 },
      { lessonId: c8l1.id, text: "What is 'stereo rendering'?", options: JSON.stringify(["Rendering separate images for each eye", "Rendering one image", "3D movie rendering", "360 video"]), answer: "Rendering separate images for each eye", order: 2 },
      { lessonId: c8l1.id, text: "What is 'single-pass instanced rendering'?", options: JSON.stringify(["Rendering both eyes in one pass efficiently", "Rendering each eye separately", "Rendering one eye at a time", "Rendering without GPU"]), answer: "Rendering both eyes in one pass efficiently", order: 3 },
      { lessonId: c8l1.id, text: "What is 'lens distortion correction'?", options: JSON.stringify(["Correcting the barrel distortion from VR lenses", "Fixing screen scratches", "Adjusting headset fit", "Calibrating controllers"]), answer: "Correcting the barrel distortion from VR lenses", order: 4 },
      { lessonId: c8l1.id, text: "What is 'chromatic aberration correction' in VR?", options: JSON.stringify(["Correcting color fringing from lenses", "Adding color effects", "Improving contrast", "Adjusting brightness"]), answer: "Correcting color fringing from lenses", order: 5 },
      { lessonId: c8l1.id, text: "What is 'foveated rendering'?", options: JSON.stringify(["Rendering high detail only where the eye looks", "Rendering everything at full detail", "Lowering resolution", "Increasing resolution"]), answer: "Rendering high detail only where the eye looks", order: 6 },
      { lessonId: c8l1.id, text: "What is 'fixed foveated rendering'?", options: JSON.stringify(["Lowering resolution in peripheral vision", "Eye-tracked rendering", "Full resolution rendering", "No rendering optimization"]), answer: "Lowering resolution in peripheral vision", order: 7 },
      { lessonId: c8l1.id, text: "What is 'multiview rendering'?", options: JSON.stringify(["Rendering multiple views in a single pass", "Single view rendering", "2D rendering", "Offline rendering"]), answer: "Rendering multiple views in a single pass", order: 8 },
      { lessonId: c8l1.id, text: "What is 'render scale' in VR?", options: JSON.stringify(["The internal resolution multiplier for rendering", "The screen size", "The headset size", "The texture size"]), answer: "The internal resolution multiplier for rendering", order: 9 },
      { lessonId: c8l1.id, text: "What is 'timewarp' in VR rendering?", options: JSON.stringify(["Reprojecting frames to match head movement", "Time travel", "Slow motion effect", "Frame skipping"]), answer: "Reprojecting frames to match head movement", order: 10 },
      { lessonId: c8l2.id, text: "What is a 'shader' in graphics programming?", options: JSON.stringify(["A program that runs on the GPU", "A type of material", "A 3D model", "A texture file"]), answer: "A program that runs on the GPU", order: 1 },
      { lessonId: c8l2.id, text: "What is a 'vertex shader'?", options: JSON.stringify(["Processes individual vertices of 3D models", "Processes pixels", "Applies textures", "Handles lighting"]), answer: "Processes individual vertices of 3D models", order: 2 },
      { lessonId: c8l2.id, text: "What is a 'fragment shader'?", options: JSON.stringify(["Processes individual pixels for rendering", "Processes vertices", "Manages geometry", "Handles audio"]), answer: "Processes individual pixels for rendering", order: 3 },
      { lessonId: c8l2.id, text: "What is 'HLSL' or 'GLSL'?", options: JSON.stringify(["Shader programming languages", "Game engines", "File formats", "3D modeling tools"]), answer: "Shader programming languages", order: 4 },
      { lessonId: c8l2.id, text: "What is 'shader optimization' for VR?", options: JSON.stringify(["Reducing shader complexity for performance", "Making shaders look better", "Adding more effects", "Increasing resolution"]), answer: "Reducing shader complexity for performance", order: 5 },
      { lessonId: c8l2.id, text: "What is 'GPU instancing'?", options: JSON.stringify(["Drawing many identical objects efficiently", "Drawing each object separately", "Creating new objects", "Deleting objects"]), answer: "Drawing many identical objects efficiently", order: 6 },
      { lessonId: c8l2.id, text: "What is 'shader variant'?", options: JSON.stringify(["A compiled version of a shader with specific settings", "A different shader type", "A material preset", "A texture map"]), answer: "A compiled version of a shader with specific settings", order: 7 },
      { lessonId: c8l2.id, text: "What is 'shader warmup'?", options: JSON.stringify(["Pre-compiling shaders to avoid runtime stutters", "Testing shaders", "Editing shaders", "Optimizing shaders"]), answer: "Pre-compiling shaders to avoid runtime stutters", order: 8 },
      { lessonId: c8l2.id, text: "What is 'mobile shader' for VR?", options: JSON.stringify(["Lightweight shaders for mobile VR headsets", "High-end PC shaders", "Console shaders", "Web shaders"]), answer: "Lightweight shaders for mobile VR headsets", order: 9 },
      { lessonId: c8l2.id, text: "What is 'shader model'?", options: JSON.stringify(["A GPU capability level for shader features", "A 3D rendering technique", "A lighting model", "A material type"]), answer: "A GPU capability level for shader features", order: 10 },
      { lessonId: c8l3.id, text: "What is 'post-processing' in VR?", options: JSON.stringify(["Effects applied after the scene is rendered", "Pre-rendering effects", "Model editing", "Texture painting"]), answer: "Effects applied after the scene is rendered", order: 1 },
      { lessonId: c8l3.id, text: "What is 'anti-aliasing' in VR?", options: JSON.stringify(["Smoothing jagged edges in the image", "Sharpening the image", "Adding noise", "Blurring the image"]), answer: "Smoothing jagged edges in the image", order: 2 },
      { lessonId: c8l3.id, text: "What is 'MSAA' in VR?", options: JSON.stringify(["Multisample anti-aliasing for edge smoothing", "A post-processing effect", "A texture filter", "A lighting technique"]), answer: "Multisample anti-aliasing for edge smoothing", order: 3 },
      { lessonId: c8l3.id, text: "What is 'TAA' in VR?", options: JSON.stringify(["Temporal anti-aliasing using previous frames", "A shader type", "A modeling tool", "A texture format"]), answer: "Temporal anti-aliasing using previous frames", order: 4 },
      { lessonId: c8l3.id, text: "What is 'bloom' effect in VR?", options: JSON.stringify(["Glow effect around bright areas", "Blur effect", "Color change", "Darkening corners"]), answer: "Glow effect around bright areas", order: 5 },
      { lessonId: c8l3.id, text: "What is 'color grading'?", options: JSON.stringify(["Adjusting colors for mood and consistency", "Changing texture colors", "Model painting", "Lighting setup"]), answer: "Adjusting colors for mood and consistency", order: 6 },
      { lessonId: c8l3.id, text: "What is 'ambient occlusion' as post-process?", options: JSON.stringify(["Adding contact shadows in real-time", "Pre-baked shadows", "Dynamic lighting", "Reflection mapping"]), answer: "Adding contact shadows in real-time", order: 7 },
      { lessonId: c8l3.id, text: "What is 'motion blur' in VR?", options: JSON.stringify(["Blurring fast-moving objects cautiously in VR", "Blurring everything", "Screen shake", "Fade transitions"]), answer: "Blurring fast-moving objects cautiously in VR", order: 8 },
      { lessonId: c8l3.id, text: "What is 'depth of field' in VR?", options: JSON.stringify(["Blurring objects at different distances", "Field of view adjustment", "Lens flare", "Vignette effect"]), answer: "Blurring objects at different distances", order: 9 },
      { lessonId: c8l3.id, text: "Why should post-processing be used carefully in VR?", options: JSON.stringify(["It can cause performance issues and discomfort", "It is not supported", "It reduces quality", "It changes colors"]), answer: "It can cause performance issues and discomfort", order: 10 },
      { lessonId: c8l4.id, text: "What is a 'draw call'?", options: JSON.stringify(["A CPU command to the GPU to render geometry", "A phone call", "A network request", "A file operation"]), answer: "A CPU command to the GPU to render geometry", order: 1 },
      { lessonId: c8l4.id, text: "What is 'static batching'?", options: JSON.stringify(["Combining static objects into one draw call", "Dynamic object rendering", "Texture combining", "Material merging"]), answer: "Combining static objects into one draw call", order: 2 },
      { lessonId: c8l4.id, text: "What is 'GPU instancing'?", options: JSON.stringify(["Drawing multiple copies of the same mesh efficiently", "Drawing each copy separately", "Creating new meshes", "Deleting meshes"]), answer: "Drawing multiple copies of the same mesh efficiently", order: 3 },
      { lessonId: c8l4.id, text: "What is 'occlusion culling'?", options: JSON.stringify(["Not rendering objects hidden from view", "Removing objects permanently", "Hiding UI elements", "Disabling audio"]), answer: "Not rendering objects hidden from view", order: 4 },
      { lessonId: c8l4.id, text: "What is 'frustum culling'?", options: JSON.stringify(["Not rendering objects outside camera view", "Rendering everything", "Clipping objects", "Hiding objects"]), answer: "Not rendering objects outside camera view", order: 5 },
      { lessonId: c8l4.id, text: "What is 'LOD (Level of Detail)'?", options: JSON.stringify(["Using simpler models at distance", "Adding detail to models", "Changing materials", "Adjusting lighting"]), answer: "Using simpler models at distance", order: 6 },
      { lessonId: c8l4.id, text: "What is 'texture atlasing'?", options: JSON.stringify(["Combining textures to reduce material count", "Increasing texture resolution", "Adding more textures", "Compressing textures"]), answer: "Combining textures to reduce material count", order: 7 },
      { lessonId: c8l4.id, text: "What is 'material merging'?", options: JSON.stringify(["Using one material for multiple objects", "Creating new materials", "Deleting materials", "Editing shaders"]), answer: "Using one material for multiple objects", order: 8 },
      { lessonId: c8l4.id, text: "What is 'overdraw' in VR rendering?", options: JSON.stringify(["Rendering the same pixel multiple times", "Excessive drawing", "High resolution", "Low frame rate"]), answer: "Rendering the same pixel multiple times", order: 9 },
      { lessonId: c8l4.id, text: "What is 'fill rate' in VR?", options: JSON.stringify(["How many pixels the GPU can render per frame", "The frame rate", "The resolution", "The polygon count"]), answer: "How many pixels the GPU can render per frame", order: 10 },
    ],
  });

  // ── Interactive 3D Content ──
  await prisma.vRContent.createMany({
    data: [
      {
        lessonId: c1l1.id,
        title: "VR Concepts Explorer",
        description: "Explore the fundamental building blocks of Virtual Reality through this interactive 3D scene.",
        format: "VR_SCENE",
        url: "scene://vr-concepts",
        settings: JSON.stringify({
          objects: [
            { type: "box", color: "#6366f1", position: [-3, 1.5, 0], scale: 1.2 },
            { type: "sphere", color: "#8b5cf6", position: [0, 1.5, 0], scale: 1.2 },
            { type: "torusKnot", color: "#a855f7", position: [3, 1.5, 0], scale: 1.0 },
            { type: "cone", color: "#ec4899", position: [-1.5, 0.5, 2.5], scale: 0.8 },
            { type: "cylinder", color: "#14b8a6", position: [1.5, 0.5, 2.5], scale: 0.8 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0a0a1a",
        }),
      },
      {
        lessonId: c2l1.id,
        title: "3D Modeling Primitives",
        description: "Interact with the basic primitives used in 3D modeling for VR.",
        format: "VR_SCENE",
        url: "scene://modeling-primitives",
        settings: JSON.stringify({
          objects: [
            { type: "box", color: "#f59e0b", position: [-2.5, 1, 0], scale: 1.1 },
            { type: "sphere", color: "#10b981", position: [0, 1, 0], scale: 1.1 },
            { type: "torus", color: "#3b82f6", position: [2.5, 1, 0], scale: 1.1 },
            { type: "cone", color: "#ef4444", position: [-1.2, 0.5, 2], scale: 0.9 },
            { type: "cylinder", color: "#8b5cf6", position: [1.2, 0.5, 2], scale: 0.9 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0a0f0a",
        }),
      },
      {
        lessonId: c3l1.id,
        title: "Hand Tracking Interaction",
        description: "Visualize how hand tracking sensors detect and map hand movements in VR space.",
        format: "VR_SCENE",
        url: "scene://hand-tracking",
        settings: JSON.stringify({
          objects: [
            { type: "sphere", color: "#f472b6", position: [-1.5, 2, 0], scale: 1.0 },
            { type: "sphere", color: "#f472b6", position: [1.5, 2, 0], scale: 1.0 },
            { type: "torus", color: "#fb923c", position: [0, 1.5, 0], scale: 0.8 },
            { type: "box", color: "#a78bfa", position: [-1, 0.5, 2], scale: 0.7 },
            { type: "box", color: "#a78bfa", position: [1, 0.5, 2], scale: 0.7 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0f0a0a",
        }),
      },
      {
        lessonId: c4l1.id,
        title: "Unity VR Workspace",
        description: "A 3D representation of the Unity development environment for VR projects.",
        format: "VR_SCENE",
        url: "scene://unity-vr",
        settings: JSON.stringify({
          objects: [
            { type: "box", color: "#2563eb", position: [-2, 1, 0], scale: 1.0 },
            { type: "sphere", color: "#16a34a", position: [0, 1, 0], scale: 1.0 },
            { type: "torusKnot", color: "#ca8a04", position: [2, 1, 0], scale: 0.9 },
            { type: "cylinder", color: "#dc2626", position: [-1, 0.5, 2], scale: 0.8 },
            { type: "cone", color: "#9333ea", position: [1, 0.5, 2], scale: 0.8 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0a0a1a",
        }),
      },
      {
        lessonId: c5l1.id,
        title: "Architectural 3D Explorer",
        description: "Explore 3D architectural forms used in VR architectural visualization.",
        format: "VR_SCENE",
        url: "scene://arch-viz",
        settings: JSON.stringify({
          objects: [
            { type: "box", color: "#d4a574", position: [-2.5, 0.8, 0], scale: 1.3 },
            { type: "cylinder", color: "#a8c5d6", position: [0, 1.2, 0], scale: 1.0 },
            { type: "cone", color: "#8b5e3c", position: [2.5, 1, 0], scale: 1.1 },
            { type: "box", color: "#e8d5b7", position: [-1.2, 0.4, 2.2], scale: 0.7 },
            { type: "box", color: "#e8d5b7", position: [1.2, 0.4, 2.2], scale: 0.7 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0a0f0f",
        }),
      },
      {
        lessonId: c6l1.id,
        title: "Storytelling in VR",
        description: "A visual representation of narrative elements in immersive VR storytelling.",
        format: "VR_SCENE",
        url: "scene://storytelling",
        settings: JSON.stringify({
          objects: [
            { type: "torus", color: "#f59e0b", position: [-2, 1.2, 0], scale: 1.0 },
            { type: "sphere", color: "#10b981", position: [0, 1.5, 0], scale: 1.1 },
            { type: "torusKnot", color: "#8b5cf6", position: [2, 1, 0], scale: 0.9 },
            { type: "cone", color: "#ec4899", position: [-1.5, 0.5, 2], scale: 0.7 },
            { type: "box", color: "#3b82f6", position: [1.5, 0.5, 2], scale: 0.7 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0f0a14",
        }),
      },
      {
        lessonId: c7l1.id,
        title: "VR Project Planning",
        description: "Visualize the structured approach to planning and scoping VR projects.",
        format: "VR_SCENE",
        url: "scene://project-planning",
        settings: JSON.stringify({
          objects: [
            { type: "box", color: "#3b82f6", position: [-2.5, 0.8, 0], scale: 1.0 },
            { type: "box", color: "#10b981", position: [0, 0.8, 0], scale: 1.0 },
            { type: "box", color: "#f59e0b", position: [2.5, 0.8, 0], scale: 1.0 },
            { type: "sphere", color: "#8b5cf6", position: [-1.2, 1.5, 2], scale: 0.6 },
            { type: "sphere", color: "#ec4899", position: [1.2, 1.5, 2], scale: 0.6 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#0a0a0f",
        }),
      },
      {
        lessonId: c8l1.id,
        title: "Rendering Pipeline Visualizer",
        description: "See how VR rendering pipelines process geometry, lighting, and post-processing effects.",
        format: "VR_SCENE",
        url: "scene://rendering-pipeline",
        settings: JSON.stringify({
          objects: [
            { type: "torusKnot", color: "#ef4444", position: [-2, 1.5, 0], scale: 1.0 },
            { type: "sphere", color: "#3b82f6", position: [0, 1.2, 0], scale: 1.2 },
            { type: "torus", color: "#10b981", position: [2, 1.5, 0], scale: 1.0 },
            { type: "cone", color: "#f59e0b", position: [-1, 0.4, 2.5], scale: 0.8 },
            { type: "cylinder", color: "#a855f7", position: [1, 0.4, 2.5], scale: 0.8 },
          ],
          autoRotate: true,
          showGrid: true,
          backgroundColor: "#05050f",
        }),
      },
    ],
  });

  // ── AR Educational Posters ──
  await prisma.aRPoster.create({
    data: {
      title: "Virtual Reality Timeline",
      description: "Explore the evolution of VR technology from the Sensorama to modern headsets.",
      lessonId: c1l1.id,
      courseId: course1.id,
      config: JSON.stringify({
        title: "VR Timeline",
        description: "From Sensorama to the Metaverse",
        posterColor: "#6366f1",
        frameColor: "#8b5cf6",
        accentColor: "#a855f7",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "torus", color: "#6366f1", position: [-1.2, 1.2, 0.3], scale: 0.6, animate: "float" },
          { type: "sphere", color: "#a855f7", position: [1.2, 0.8, 0.3], scale: 0.5, animate: "pulse" },
          { type: "cone", color: "#8b5cf6", position: [0, 0.2, 0.3], scale: 0.4, animate: "spin" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "3D Modeling Fundamentals",
      description: "Key concepts of 3D modeling: vertices, edges, faces, and topology.",
      lessonId: c2l1.id,
      courseId: course2.id,
      config: JSON.stringify({
        title: "3D Modeling",
        description: "Vertices · Edges · Faces · Topology",
        posterColor: "#ec4899",
        frameColor: "#f43f5e",
        accentColor: "#fb7185",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "box", color: "#ec4899", position: [-1, 1, 0.3], scale: 0.5, animate: "spin" },
          { type: "sphere", color: "#f43f5e", position: [1, 1, 0.3], scale: 0.5, animate: "pulse" },
          { type: "cylinder", color: "#fb7185", position: [0, 0.3, 0.3], scale: 0.4, animate: "float" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "VR Interaction Methods",
      description: "How users interact in VR: hand tracking, gaze, and controllers.",
      lessonId: c3l1.id,
      courseId: course3.id,
      config: JSON.stringify({
        title: "VR Interaction",
        description: "Hand Tracking · Gaze · Controllers",
        posterColor: "#14b8a6",
        frameColor: "#06b6d4",
        accentColor: "#2dd4bf",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "torusKnot", color: "#14b8a6", position: [0, 1.2, 0.3], scale: 0.5, animate: "float" },
          { type: "sphere", color: "#06b6d4", position: [-1.2, 0.6, 0.3], scale: 0.3, animate: "orbit" },
          { type: "sphere", color: "#2dd4bf", position: [1.2, 0.6, 0.3], scale: 0.3, animate: "orbit" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "Unity XR Development",
      description: "Building VR experiences with Unity's XR Interaction Toolkit.",
      lessonId: c4l1.id,
      courseId: course4.id,
      config: JSON.stringify({
        title: "Unity XR",
        description: "XR Interaction Toolkit · Building Blocks",
        posterColor: "#f59e0b",
        frameColor: "#f97316",
        accentColor: "#fb923c",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "box", color: "#f59e0b", position: [-1, 1, 0.3], scale: 0.4, animate: "spin" },
          { type: "torus", color: "#f97316", position: [1, 1, 0.3], scale: 0.5, animate: "float" },
          { type: "cone", color: "#fb923c", position: [0, 0.3, 0.3], scale: 0.4, animate: "pulse" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "Architectural Visualization",
      description: "Using VR to visualize architectural designs in immersive 3D.",
      lessonId: c5l1.id,
      courseId: course5.id,
      config: JSON.stringify({
        title: "ArchViz in VR",
        description: "Design · Visualize · Collaborate",
        posterColor: "#22c55e",
        frameColor: "#10b981",
        accentColor: "#34d399",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "box", color: "#22c55e", position: [-0.8, 0.8, 0.3], scale: 0.5, animate: "float" },
          { type: "cylinder", color: "#10b981", position: [0.8, 0.6, 0.3], scale: 0.5, animate: "spin" },
          { type: "torus", color: "#34d399", position: [0, 0.2, 0.3], scale: 0.3, animate: "pulse" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "Immersive Storytelling",
      description: "Crafting narrative experiences that leverage VR's unique capabilities.",
      lessonId: c6l1.id,
      courseId: course6.id,
      config: JSON.stringify({
        title: "Storytelling in VR",
        description: "Narrative · Emotion · Immersion",
        posterColor: "#a855f7",
        frameColor: "#d946ef",
        accentColor: "#c084fc",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "torusKnot", color: "#a855f7", position: [0, 1, 0.3], scale: 0.5, animate: "spin" },
          { type: "sphere", color: "#d946ef", position: [-1, 0.5, 0.3], scale: 0.3, animate: "float" },
          { type: "sphere", color: "#c084fc", position: [1, 0.5, 0.3], scale: 0.3, animate: "float" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "VR Project Lifecycle",
      description: "From concept to launch: managing VR development projects effectively.",
      lessonId: c7l1.id,
      courseId: course7.id,
      config: JSON.stringify({
        title: "VR Project Management",
        description: "Scope · Budget · Agile · QA",
        posterColor: "#0ea5e9",
        frameColor: "#3b82f6",
        accentColor: "#60a5fa",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "cylinder", color: "#0ea5e9", position: [-1, 0.8, 0.3], scale: 0.4, animate: "float" },
          { type: "box", color: "#3b82f6", position: [1, 0.8, 0.3], scale: 0.4, animate: "spin" },
          { type: "torus", color: "#60a5fa", position: [0, 0.2, 0.3], scale: 0.3, animate: "pulse" },
        ],
      }),
    },
  });

  await prisma.aRPoster.create({
    data: {
      title: "Graphics Rendering Pipeline",
      description: "Understanding the rendering pipeline for high-performance VR graphics.",
      lessonId: c8l1.id,
      courseId: course8.id,
      config: JSON.stringify({
        title: "VR Rendering",
        description: "Pipelines · Shaders · Post-Processing",
        posterColor: "#ef4444",
        frameColor: "#dc2626",
        accentColor: "#f87171",
        backgroundColor: "#0a0a1a",
        autoRotate: true,
        showParticles: true,
        objects: [
          { type: "torusKnot", color: "#ef4444", position: [0, 1.1, 0.3], scale: 0.5, animate: "spin" },
          { type: "cone", color: "#dc2626", position: [-1, 0.5, 0.3], scale: 0.4, animate: "float" },
          { type: "sphere", color: "#f87171", position: [1, 0.5, 0.3], scale: 0.3, animate: "pulse" },
        ],
      }),
    },
  });

  await prisma.enrollment.create({
    data: { userId: student.id, courseId: course1.id, progress: 50 },
  });
  await prisma.enrollment.create({
    data: { userId: student.id, courseId: course2.id, progress: 25 },
  });
  await prisma.enrollment.create({
    data: { userId: student.id, courseId: course3.id, progress: 10 },
  });

  // Mark some lessons as completed for the student
  await prisma.progress.create({
    data: {
      userId: student.id,
      lessonId: c1l1.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
  await prisma.progress.create({
    data: {
      userId: student.id,
      lessonId: c1l2.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // ── Realistic School Campus Buildings ──
  const campusBuildings = [
    {
      name: "Administration Building", abbreviation: "ADM", color: "#8B7355",
      x: -2, z: -2, w: 5, d: 3, h: 3.5,
      dept: "School Administration",
      desc: "The historic main administration building featuring the school's central offices, admissions, and the principal's suite. Built in 1920, its classical architecture defines the campus character."
    },
    {
      name: "Science & Technology Center", abbreviation: "STC", color: "#4A90D9",
      x: -10, z: 2, w: 4.5, d: 3.5, h: 3.2,
      dept: "Science & Technology",
      desc: "State-of-the-art science facility with 12 fully equipped laboratories for physics, chemistry, and biology. Features a planetarium dome on the roof and a greenhouse wing."
    },
    {
      name: "Liberal Arts Hall", abbreviation: "LAH", color: "#C4956A",
      x: 9, z: 3, w: 4.5, d: 3, h: 3,
      dept: "Humanities & Arts",
      desc: "Houses the departments of English, History, Philosophy, and Foreign Languages. The building features a 300-seat lecture hall and the Elizabethan-style reading room."
    },
    {
      name: "Engineering & Robotics", abbreviation: "ENG", color: "#D4764E",
      x: -9, z: -7, w: 4, d: 3, h: 3.5,
      dept: "Engineering",
      desc: "Home to the robotics lab, 3D printing facility, and engineering workshops. The adjacent outdoor testing area hosts the annual robotics competition."
    },
    {
      name: "Business & Economics", abbreviation: "BEC", color: "#2E8B57",
      x: 8, z: -7, w: 4, d: 3, h: 3,
      dept: "Business & Economics",
      desc: "Modern facility with a simulated trading floor, collaborative workspaces, and the L. Douglas Entrepreneurship Center."
    },
    {
      name: "Memorial Library", abbreviation: "LIB", color: "#6B5B8A",
      x: 0, z: 5, w: 5, d: 3.5, h: 4,
      dept: "Library & Media Services",
      desc: "A five-story Gothic-revival building housing over 200,000 volumes. Features silent study halls, group collaboration rooms, a digital media lab, and the rare book collection."
    },
    {
      name: "Student Union", abbreviation: "SUB", color: "#C0392B",
      x: 4, z: -10, w: 4.5, d: 3, h: 2.8,
      dept: "Student Affairs",
      desc: "The heart of student life featuring a food court, coffee shop, game room, student government offices, and the campus bookstore."
    },
    {
      name: "Gymnasium & Sports Complex", abbreviation: "GYM", color: "#5DADE2",
      x: -4, z: -11, w: 4, d: 3.5, h: 3.5,
      dept: "Athletics",
      desc: "A full athletic facility with a regulation basketball court, indoor track, weight training rooms, locker rooms, and championship banners lining the walls."
    },
    {
      name: "Eastwood Hall Dormitory", abbreviation: "EWH", color: "#CD7F32",
      x: -12, z: 9, w: 3.5, d: 2.5, h: 4,
      dept: "Residential Life",
      desc: "One of the oldest dormitories on campus, housing 200 students. Features a courtyard garden, common rooms, and the famous ivy-covered east facade."
    },
    {
      name: "Westwood Hall Dormitory", abbreviation: "WWH", color: "#CD7F32",
      x: 11, z: 9, w: 3.5, d: 2.5, h: 4,
      dept: "Residential Life",
      desc: "Modern suite-style residence hall housing 250 students. Features a ground-floor cafe, laundry facilities, and panoramic views of the campus from the upper floors."
    },
    {
      name: "Performing Arts Center", abbreviation: "PAC", color: "#8E44AD",
      x: -10, z: -10, w: 3.5, d: 2.5, h: 2.5,
      dept: "Performing Arts",
      desc: "A 500-seat auditorium hosting theatrical productions, concerts, and school assemblies. Features professional-grade lighting, sound, and fly system."
    },
    {
      name: "Campus Security & Services", abbreviation: "CSS", color: "#2C3E50",
      x: 0, z: 13, w: 2, d: 1.5, h: 1.5,
      dept: "Campus Safety",
      desc: "Campus security headquarters and welcome center. Monitors campus safety 24/7 and provides visitor information."
    },
  ];

  for (const b of campusBuildings) {
    await prisma.campusBuilding.create({
      data: {
        name: b.name,
        abbreviation: b.abbreviation,
        color: b.color,
        positionX: b.x,
        positionZ: b.z,
        width: b.w,
        depth: b.d,
        height: b.h,
        department: b.dept,
        description: b.desc,
      },
    });
  }

  // ── Lab Experiments ──
  await prisma.labExperiment.create({
    data: {
      title: "Acid-Base Neutralization",
      description: "Mix hydrochloric acid with sodium hydroxide to observe a neutralization reaction",
      category: "CHEMISTRY",
      config: JSON.stringify({
        title: "Acid-Base Neutralization",
        description: "HCl + NaOH → NaCl + H₂O",
        backgroundColor: "#0a0a1a",
        equipment: [
          { name: "beaker1", type: "beaker", position: [-1.2, 0.08, 0], color: "#6366f1", liquidColor: "#ff6b6b", liquidHeight: 0.2, label: "HCl" },
          { name: "beaker2", type: "beaker", position: [1.2, 0.08, 0], color: "#8b5cf6", liquidColor: "#4ecdc4", liquidHeight: 0.2, label: "NaOH" },
          { name: "flask", type: "flask", position: [0, 0.08, 0.5], color: "#a855f7", label: "NaCl" },
          { name: "burner1", type: "burner", position: [0, 0.08, -0.5], color: "#94a3b8" },
        ],
        reactions: [{
          trigger: "combine",
          description: "Acid and base neutralize to form salt and water",
          effect: "colorChange",
          targetColor: "#98d8c8",
          bubbles: true,
        }],
        steps: [
          { id: "s1", text: "Place beaker of Hydrochloric Acid (HCl) on the left and Sodium Hydroxide (NaOH) on the right.", action: "observe" },
          { id: "s2", text: "Light the Bunsen burner to prepare for the reaction.", action: "observe" },
          { id: "s3", text: "Combine the acid and base. Watch the neutralization reaction produce salt water!", action: "combine" },
        ],
      }),
    },
  });

  await prisma.labExperiment.create({
    data: {
      title: "Copper Sulfate Precipitation",
      description: "Observe the formation of copper hydroxide precipitate",
      category: "CHEMISTRY",
      config: JSON.stringify({
        title: "Copper Sulfate Precipitation",
        description: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
        backgroundColor: "#0a0a1a",
        equipment: [
          { name: "beaker1", type: "beaker", position: [-1, 0.08, 0], color: "#6366f1", liquidColor: "#4a90d9", liquidHeight: 0.25, label: "CuSO₄" },
          { name: "cylinder1", type: "cylinder", position: [1, 0.08, 0], color: "#8b5cf6", liquidColor: "#ffffff", liquidHeight: 0.2, label: "NaOH" },
          { name: "tube1", type: "tube", position: [0, 0.08, 0.4], color: "#94a3b8", label: "Mixture" },
        ],
        reactions: [{
          trigger: "combine",
          description: "Blue copper sulfate reacts with clear NaOH to form blue-green precipitate",
          effect: "colorChange",
          targetColor: "#5dade2",
          bubbles: false,
          smoke: true,
        }],
        steps: [
          { id: "s1", text: "Pour copper sulfate solution into the beaker.", action: "observe" },
          { id: "s2", text: "Add sodium hydroxide solution drop by drop.", action: "observe" },
          { id: "s3", text: "Watch the blue-green copper hydroxide precipitate form!", action: "combine" },
        ],
      }),
    },
  });

  await prisma.labExperiment.create({
    data: {
      title: "Exothermic Reaction",
      description: "Watch magnesium react with hydrochloric acid producing heat and hydrogen gas",
      category: "CHEMISTRY",
      config: JSON.stringify({
        title: "Exothermic Reaction",
        description: "Mg + 2HCl → MgCl₂ + H₂↑ + Heat",
        backgroundColor: "#0a0a1a",
        equipment: [
          { name: "beaker1", type: "beaker", position: [0, 0.08, 0], color: "#6366f1", liquidColor: "#ff6b6b", liquidHeight: 0.25, label: "HCl" },
          { name: "tube1", type: "tube", position: [-0.8, 0.08, 0.3], color: "#94a3b8", label: "Mg strip" },
          { name: "burner1", type: "burner", position: [0.8, 0.08, -0.3], color: "#94a3b8" },
        ],
        reactions: [{
          trigger: "combine",
          description: "Magnesium dissolves in acid, releasing hydrogen gas and heat",
          effect: "colorChange",
          targetColor: "#ffa07a",
          bubbles: true,
          flame: true,
        }],
        steps: [
          { id: "s1", text: "Add hydrochloric acid to the beaker.", action: "observe" },
          { id: "s2", text: "Drop in the magnesium strip.", action: "observe" },
          { id: "s3", text: "Watch the vigorous reaction — bubbles of hydrogen gas and heat are released!", action: "combine" },
        ],
      }),
    },
  });

  // ── Module Resources (PDFs & Articles) ──
  const allModules = await prisma.module.findMany({
    include: { course: { select: { title: true } } },
  });

  for (const mod of allModules.slice(0, 4)) {
    await prisma.moduleResource.createMany({
      data: [
        {
          moduleId: mod.id,
          title: `${mod.course.title} - Module Guide (PDF)`,
          type: "PDF",
          url: "#",
          order: 0,
        },
        {
          moduleId: mod.id,
          title: `${mod.title} - Key Concepts`,
          type: "ARTICLE",
          content: `<h2>Key Concepts for ${mod.title}</h2><p>This article covers the fundamental concepts you need to understand for this module.</p><h3>Learning Objectives</h3><ul><li>Understand the core principles</li><li>Apply theoretical knowledge to practical scenarios</li><li>Analyze real-world examples</li></ul><h3>Summary</h3><p>Mastering these concepts will provide a strong foundation for the rest of your learning journey. Remember to take notes and review the material regularly.</p>`,
          order: 1,
        },
      ],
    });
  }

  for (const mod of allModules.slice(4, 8)) {
    await prisma.moduleResource.create({
      data: {
        moduleId: mod.id,
        title: `${mod.course.title} - Reference Material`,
        type: "PDF",
        url: "#",
        order: 0,
      },
    });
    await prisma.moduleResource.create({
      data: {
        moduleId: mod.id,
        title: "Study Guide",
        type: "ARTICLE",
        content: `<h2>Study Guide</h2><p>Use this study guide to reinforce your understanding of the module material.</p><h3>Key Topics</h3><ul><li>Topic 1: Core definitions and terminology</li><li>Topic 2: Practical applications</li><li>Topic 3: Case studies and examples</li></ul><h3>Practice Questions</h3><p>Try to answer these questions after reviewing the module:</p><ol><li>What are the main takeaways?</li><li>How does this connect to previous modules?</li><li>Can you explain the concept to someone else?</li></ol>`,
        order: 1,
      },
    });
  }

  // ── Fill in missing content for text-based lessons ──
  const contentLessons = await prisma.lesson.findMany({
    where: { type: "ARTICLE", content: null },
  });
  for (const l of contentLessons) {
    await prisma.lesson.update({
      where: { id: l.id },
      data: {
        content: `${l.title}\n\n${l.description ?? "Explore this topic in depth."}\n\nKey Learning Points:\n\n1. Understand the fundamental concepts and principles covered in this module.\n2. Apply theoretical knowledge to practical scenarios and real-world applications.\n3. Analyze case studies and examples to deepen your understanding.\n4. Evaluate different approaches and methodologies used in this field.\n\nTake your time to review this material thoroughly. Take notes on important concepts and try to connect them with what you've learned in previous lessons.`,
      },
    });
  }

  // ── Achievements ──
  const achievements = [
    { title: "First Steps", description: "Complete your first lesson", icon: "🎯", category: "lessons", metric: "lessons_completed", threshold: 1 },
    { title: "Quick Learner", description: "Complete 10 lessons", icon: "📚", category: "lessons", metric: "lessons_completed", threshold: 10 },
    { title: "Scholar", description: "Complete 25 lessons", icon: "🎓", category: "lessons", metric: "lessons_completed", threshold: 25 },
    { title: "Course Champion", description: "Complete an entire course", icon: "🏅", category: "courses", metric: "courses_completed", threshold: 1 },
    { title: "Knowledge Seeker", description: "Complete 5 courses", icon: "🏆", category: "courses", metric: "courses_completed", threshold: 5 },
    { title: "Perfect Score", description: "Score 100% on any quiz", icon: "💯", category: "quizzes", metric: "perfect_quizzes", threshold: 1 },
    { title: "Quiz Whiz", description: "Score 100% on 5 quizzes", icon: "🧠", category: "quizzes", metric: "perfect_quizzes", threshold: 5 },
    { title: "Streak Starter", description: "Maintain a 3-day streak", icon: "🔥", category: "streaks", metric: "longest_streak", threshold: 3 },
    { title: "Streak Master", description: "Maintain a 7-day streak", icon: "⚡", category: "streaks", metric: "longest_streak", threshold: 7 },
    { title: "Streak Legend", description: "Maintain a 30-day streak", icon: "💎", category: "streaks", metric: "longest_streak", threshold: 30 },
    { title: "Note Taker", description: "Create 5 notes", icon: "📝", category: "engagement", metric: "notes_created", threshold: 5 },
    { title: "Journaler", description: "Create 20 notes", icon: "📓", category: "engagement", metric: "notes_created", threshold: 20 },
    { title: "Lab Explorer", description: "Complete a lab experiment", icon: "🔬", category: "engagement", metric: "labs_completed", threshold: 1 },
    { title: "Lab Scientist", description: "Complete 3 lab experiments", icon: "🧪", category: "engagement", metric: "labs_completed", threshold: 3 },
    { title: "Flashcard Fan", description: "Review 20 flashcards", icon: "🃏", category: "engagement", metric: "flashcards_reviewed", threshold: 20 },
    { title: "Flashcard Master", description: "Review 100 flashcards", icon: "👑", category: "engagement", metric: "flashcards_reviewed", threshold: 100 },
    { title: "Early Bird", description: "Complete a lesson before 8 AM", icon: "🌅", category: "special", metric: "early_lessons", threshold: 1 },
    { title: "Night Owl", description: "Complete a lesson after 10 PM", icon: "🦉", category: "special", metric: "night_lessons", threshold: 1 },
    { title: "Dedicated", description: "Log in for 7 consecutive days", icon: "📅", category: "streaks", metric: "login_streak", threshold: 7 },
    { title: "Campus Explorer", description: "View 5 campus buildings", icon: "🏛️", category: "engagement", metric: "buildings_viewed", threshold: 5 },
  ];

  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }

  // Unlock some achievements for the test student for demo purposes
  const demoUser = await prisma.user.findUnique({ where: { email: "student@arelms.com" } });
  if (demoUser) {
    const allAchievements = await prisma.achievement.findMany();
    const demoUnlocks = allAchievements.filter((a) =>
      ["First Steps", "Streak Starter", "Note Taker", "Lab Explorer", "Flashcard Fan", "Early Bird"].includes(a.title),
    );
    for (const a of demoUnlocks) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: demoUser.id, achievementId: a.id } },
        update: { progress: a.threshold, unlocked: true, unlockedAt: new Date() },
        create: { userId: demoUser.id, achievementId: a.id, progress: a.threshold, unlocked: true, unlockedAt: new Date() },
      });
    }
    // Partial progress on some
    const partials = allAchievements.filter((a) =>
      ["Quick Learner", "Perfect Score", "Flashcard Master"].includes(a.title),
    );
    for (const a of partials) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: demoUser.id, achievementId: a.id } },
        update: { progress: Math.floor(a.threshold * 0.4) },
        create: { userId: demoUser.id, achievementId: a.id, progress: Math.floor(a.threshold * 0.4), unlocked: false },
      });
    }
  }

  console.log("✅ Seed data created successfully");
  console.log(`   Instructor: instructor@arelms.com / password123`);
  console.log(`   Student:    student@arelms.com / password123`);
  console.log(`   Courses: VR Fundamentals, 3D Modeling for VR, VR Interaction Design, VR Game Development, VR for Architecture, Immersive Storytelling, VR Project Management, Advanced VR Graphics`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
