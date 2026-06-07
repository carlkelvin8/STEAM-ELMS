import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "sup", "yo", "good day"];

function matchIntent(input: string) {
  const lower = input.toLowerCase().trim();

  if (greetings.some((g) => lower.includes(g) || lower === g)) return "GREETING";
  if (lower.includes("help") || lower.includes("what can you") || lower.includes("commands") || lower.includes("what do you")) return "HELP";
  if (lower.includes("course") || lower.includes("class") || lower.includes("subject") || lower.includes("learn")) return "COURSES";
  if (lower.includes("progress") || lower.includes("how am i") || lower.includes("completion") || lower.includes("status")) return "PROGRESS";
  if (lower.includes("achieve") || lower.includes("badge") || lower.includes("reward") || lower.includes("trophy")) return "ACHIEVEMENTS";
  if (lower.includes("enroll") || lower.includes("registered") || lower.includes("signed up") || lower.includes("joined")) return "ENROLLMENT";
  if (lower.includes("note") || lower.includes("my notes") || lower.includes("study notes")) return "NOTES";
  if (lower.includes("grade") || lower.includes("score") || lower.includes("mark") || lower.includes("gpa") || lower.includes("result")) return "GRADES";
  if (lower.includes("lesson") || lower.includes("module") || lower.includes("topic") || lower.includes("chapter")) return "LESSONS";
  if (lower.includes("tip") || lower.includes("advice") || lower.includes("study") || lower.includes("how to") || lower.includes("recommend")) return "TIPS";
  if (lower.includes("vr") || lower.includes("virtual reality") || lower.includes("ar") || lower.includes("augmented reality") || lower.includes("what is") || lower.includes("difference")) return "VR_AR";

  return "UNKNOWN";
}

function getGradeEmoji(grade: string | null) {
  switch (grade) {
    case "A": return "🌟";
    case "B": return "👍";
    case "C": return "📚";
    case "D": return "⚠️";
    case "F": return "🔴";
    default: return "📊";
  }
}

function getMotivationalTip(percentage: number | null): string {
  if (percentage == null) return "Start your learning journey by completing your first lesson!";
  if (percentage >= 90) return "Outstanding work! Consider helping peers or exploring advanced topics.";
  if (percentage >= 80) return "Great job! You're mastering this subject. Try the next challenge.";
  if (percentage >= 70) return "Good progress! Review the lessons you scored lower on to improve.";
  if (percentage >= 60) return "You're making progress. Focus on revisiting difficult topics.";
  return "Keep pushing forward! Try reviewing lesson materials and taking notes.";
}

export async function POST(request: NextRequest) {
  const { message, userId } = await request.json();

  if (!message || !userId) {
    return Response.json({ error: "message and userId are required" }, { status: 400 });
  }

  const intent = matchIntent(message);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      return Response.json({
        response: "I couldn't find your account. Please try **signing in again** to use the Learning Assistant.",
      });
    }

    const greeting = (() => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    })();

    switch (intent) {
      /* ──────────────────── GREETING ──────────────────── */

      case "GREETING": {
        return Response.json({
          response: `${greeting}, **${user.name}**! 👋 Welcome to your STEAM ELMS Learning Assistant.\n\nI'm here to help you succeed. Here's what I can do:\n\n📚 **Course Information** — Browse available courses and see what to learn next\n📊 **Progress & Grades** — Track your completion and scores\n🏆 **Achievements** — View badges you've earned\n🥽 **VR & AR Explained** — Learn about virtual and augmented reality\n📝 **Notes** — Review your study notes\n📋 **Enrollments** — Check your registered courses\n💡 **Study Tips** — Get personalized learning advice\n\nWhat would you like to explore today?`,
        });
      }

      /* ──────────────────── HELP ──────────────────── */

      case "HELP": {
        return Response.json({
          response: `## 🤖 Learning Assistant Commands\n\nHere are the topics I can help you with:\n\n| Command | Description |\n|---------|------------|\n| **Courses / Classes** | Browse all available courses with details |\n| **My Progress** | Track your lesson completion and course progress |\n| **My Grades / Scores** | View your assessment scores and letter grades |\n| **My Achievements / Badges** | See the badges you've unlocked |\n| **My Notes** | Review your most recent study notes |\n| **Enrolled Courses** | Check what you're currently enrolled in |\n| **Study Tips** | Get personalized learning advice |\n| **VR / AR** | Learn about Virtual and Augmented Reality |\n\nTry typing something like:\n> *"Show me my courses"*\n> *"How am I doing in my classes?"*\n> *"What is VR?"*`,
        });
      }

      /* ──────────────────── COURSES ──────────────────── */

      case "COURSES": {
        const courses = await prisma.course.findMany({
          take: 15,
          orderBy: { createdAt: "desc" },
          include: {
            instructor: { select: { name: true } },
            tags: true,
            enrollments: { select: { id: true } },
            modules: {
              select: { _count: { select: { lessons: true } } },
            },
          },
        });

        if (courses.length === 0) {
          return Response.json({
            response: "📚 No courses are currently available. Check back soon for new learning opportunities!",
          });
        }

        const totalLessons = courses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m._count.lessons, 0), 0);

        const courseBlocks = courses.slice(0, 6).map((c, i) => {
          const lessonCount = c.modules.reduce((s, m) => s + m._count.lessons, 0);
          const tags = c.tags.map((t) => `\`${t.tag}\``).join(" ");
          return `**${i + 1}. ${c.title}**\n   📖 ${lessonCount} lessons | 👤 ${c.instructor.name} | 👥 ${c.enrollments.length} enrolled\n   ${tags ? `   🏷️ ${tags}` : ""}`;
        }).join("\n\n");

        const remaining = courses.length - 6;

        return Response.json({
          response: `## 📚 Available Courses\n\nWe have **${courses.length} courses** with **${totalLessons} lessons** total.\n\n${courseBlocks}${remaining > 0 ? `\n\n_...and ${remaining} more courses. Visit the **Courses** page for the full list._` : ""}\n\n💡 **Tip:** Use the **Courses** page to filter by category or difficulty level!`,
        });
      }

      /* ──────────────────── PROGRESS ──────────────────── */

      case "PROGRESS": {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                modules: {
                  include: { lessons: { select: { id: true } } },
                },
              },
            },
          },
        });

        if (enrollments.length === 0) {
          return Response.json({
            response: `You're not enrolled in any courses yet, **${user.name}**. 🎯\n\nHead to the **Courses** page to explore and enroll in a course that interests you!\n\n💡 *Starting with a subject you're passionate about makes learning easier.*`,
          });
        }

        const progressRows = await Promise.all(
          enrollments.map(async (e) => {
            const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
            const completed = await prisma.progress.count({
              where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
            });
            const total = lessonIds.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
            return `**${e.course.title}**\n\`${bar}\` ${completed}/${total} lessons (${pct}%)\n${total > 0 && completed === total ? "✅ **Completed!**" : total > 0 ? `⏳ ${total - completed} lessons remaining` : "📝 No lessons yet"}`;
          })
        );

        const totalCompleted = enrollments.reduce((sum, e) => sum + (e.completed ? 1 : 0), 0);

        return Response.json({
          response: `## 📊 Your Learning Progress\n\nYou're enrolled in **${enrollments.length} course${enrollments.length > 1 ? "s" : ""}** (${totalCompleted} completed).\n\n${progressRows.join("\n\n")}\n\n💡 **Tip:** Consistency is key! Try to complete at least one lesson each day to build momentum. 🚀`,
        });
      }

      /* ──────────────────── GRADES ──────────────────── */

      case "GRADES": {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                modules: {
                  include: { lessons: { select: { id: true, title: true } } },
                },
              },
            },
          },
        });

        if (enrollments.length === 0) {
          return Response.json({
            response: "You're not enrolled in any courses yet, so there are no grades to display. Once you enroll and complete lessons, your scores will appear here! 📚",
          });
        }

        const gradeRows = await Promise.all(
          enrollments.map(async (e) => {
            const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
            const progress = await prisma.progress.findMany({
              where: { userId, lessonId: { in: lessonIds }, score: { not: null } },
            });
            const submissions = await prisma.submission.findMany({
              where: { userId, lessonId: { in: lessonIds }, score: { not: null } },
            });
            const scores = [
              ...progress.map((p) => p.score!),
              ...submissions.map((s) => s.score!),
            ];
            const avg = scores.length > 0
              ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
              : null;
            const letter = avg != null
              ? avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F"
              : null;
            const emoji = getGradeEmoji(letter);
            return `**${e.course.title}**  ${emoji}\n   Score: \`${avg != null ? `${avg}%` : "—"}\`  |  Grade: **${letter ?? "—"}**  |  Assessments: ${scores.length}`;
          })
        );

        const allScores = (await Promise.all(
          enrollments.map(async (e) => {
            const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
            const p = await prisma.progress.findMany({ where: { userId, lessonId: { in: lessonIds }, score: { not: null } } });
            const s = await prisma.submission.findMany({ where: { userId, lessonId: { in: lessonIds }, score: { not: null } } });
            return [...p.map((x) => x.score!), ...s.map((x) => x.score!)];
          })
        )).flat();

        const overallAvg = allScores.length > 0
          ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
          : null;

        const overallLetter = overallAvg != null
          ? overallAvg >= 90 ? "A" : overallAvg >= 80 ? "B" : overallAvg >= 70 ? "C" : overallAvg >= 60 ? "D" : "F"
          : null;

        // Calculate GPA
        const gpa = enrollments.length > 0
          ? (enrollments.reduce((sum, e) => {
              const avg = overallAvg ?? 0;
              if (avg >= 90) return sum + 4.0;
              if (avg >= 80) return sum + 3.0;
              if (avg >= 70) return sum + 2.0;
              if (avg >= 60) return sum + 1.0;
              return sum + 0;
            }, 0) / enrollments.length).toFixed(2)
          : null;

        return Response.json({
          response: `## 📊 Academic Grades\n\n**Overall Summary**\n📈 GPA: \`${gpa ?? "—"}\`  |  Average: \`${overallAvg != null ? `${overallAvg}%` : "—"}\`  |  Grade: **${overallLetter ?? "—"}** ${getGradeEmoji(overallLetter)}\n\n${gradeRows.join("\n\n")}\n\n💡 **Study Tip:** ${getMotivationalTip(overallAvg)}\n\nFor a detailed breakdown by lesson, visit the **Grades** page.`,
        });
      }

      /* ──────────────────── ACHIEVEMENTS ──────────────────── */

      case "ACHIEVEMENTS": {
        const achievements = await prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: [{ unlocked: "desc" }, { progress: "desc" }],
        });

        if (achievements.length === 0) {
          return Response.json({
            response: "🏆 No achievements yet! Complete lessons, take notes, and engage with courses to earn badges.\n\n💡 *Every achievement starts with a single lesson. Start learning today!*",
          });
        }

        const unlocked = achievements.filter((a) => a.unlocked);
        const locked = achievements.filter((a) => !a.unlocked);

        const unlockedBlocks = unlocked.length > 0
          ? unlocked.map((a) => `✅ ${a.achievement.icon} **${a.achievement.title}** — ${a.achievement.description}`).join("\n")
          : "None yet. Keep learning to earn your first badge!";

        const lockedBlocks = locked.length > 0
          ? locked.map((a) => {
              const progress = a.achievement.threshold > 0
                ? Math.min(Math.round((a.progress / a.achievement.threshold) * 100), 100)
                : 0;
              const bar = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));
              return `🔒 ${a.achievement.icon} **${a.achievement.title}** — ${a.achievement.description}\n   \`${bar}\` ${a.progress}/${a.achievement.threshold} (${progress}%)`;
            }).join("\n")
          : "All achievements unlocked! 🎉";

        return Response.json({
          response: `## 🏆 Achievements\n\n**Unlocked (${unlocked.length})**\n${unlockedBlocks}\n\n**In Progress (${locked.length})**\n${lockedBlocks}\n\n💡 Focus on completing the in-progress achievements to earn more badges!`,
        });
      }

      /* ──────────────────── ENROLLMENT ──────────────────── */

      case "ENROLLMENT": {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              select: { title: true, category: true, difficulty: true, estimatedHours: true, description: true },
            },
          },
          orderBy: { enrolledAt: "desc" },
        });

        if (enrollments.length === 0) {
          return Response.json({
            response: `You're not enrolled in any courses yet, **${user.name}**. 🎯\n\nBrowse the **Courses** page to find something that sparks your interest!\n\n💡 *Learning something new every day keeps the mind sharp.*`,
          });
        }

        const totalHours = enrollments.reduce((sum, e) => sum + (e.course.estimatedHours ?? 0), 0);

        const enrolledBlocks = enrollments.map((e, i) =>
          `**${i + 1}. ${e.course.title}**\n   📂 ${e.course.category ?? "General"} | ${e.course.difficulty ?? "All levels"}${e.course.estimatedHours ? ` | ⏱️ ${e.course.estimatedHours}h` : ""}`
        ).join("\n\n");

        return Response.json({
          response: `## 📋 Your Enrolled Courses\n\nYou're enrolled in **${enrollments.length} course${enrollments.length > 1 ? "s" : ""}** (${totalHours}h total estimated).\n\n${enrolledBlocks}\n\n💡 **Tip:** Pick one course to focus on and complete it before moving to the next for the best learning results.`,
        });
      }

      /* ──────────────────── NOTES ──────────────────── */

      case "NOTES": {
        const notes = await prisma.note.findMany({
          where: { userId },
          include: {
            lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        });

        if (notes.length === 0) {
          return Response.json({
            response: "You haven't created any notes yet. 📝\n\nNotes are a great way to reinforce learning! While studying in any lesson, use the notes feature to jot down key concepts.\n\n💡 *Writing things down helps retain information better.*",
          });
        }

        const notesBlocks = notes.map((n, i) => {
          const preview = n.content.length > 100 ? n.content.slice(0, 100) + "..." : n.content;
          return `**${i + 1}. ${n.lesson.title}** (${n.lesson.module.course.title})\n   > "${preview}"`;
        }).join("\n\n");

        return Response.json({
          response: `## 📝 Recent Study Notes\n\nYou have **${notes.length} note${notes.length > 1 ? "s" : ""}** saved. Here are your most recent:\n\n${notesBlocks}\n\n💡 **Tip:** Reviewing your notes regularly helps reinforce what you've learned!\n\nVisit the **Notes** page to manage all your notes.`,
        });
      }

      /* ──────────────────── LESSONS ──────────────────── */

      case "LESSONS": {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: { select: { id: true, title: true, type: true, duration: true } },
                  },
                },
              },
            },
          },
        });

        if (enrollments.length === 0) {
          return Response.json({
            response: "You're not enrolled in any courses yet. Once you enroll, I can show you your lessons! 📚",
          });
        }

        const lessonBlocks = await Promise.all(
          enrollments.slice(0, 2).map(async (e) => {
            const totalLessons = e.course.modules.flatMap((m) => m.lessons).length;
            const completedLessons = await prisma.progress.count({
              where: { userId, lessonId: { in: e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)) }, status: "COMPLETED" },
            });
            const lessons = e.course.modules.flatMap((m) => m.lessons).slice(0, 5);
            const lessonList = lessons.map((l) => {
              const typeIcon = l.type === "VIDEO" ? "🎬" : l.type === "ARTICLE" ? "📖" : "📝";
              return `${typeIcon} **${l.title}** ${l.duration ? `(${l.duration}min)` : ""}`;
            }).join("\n");
            return `**${e.course.title}** — ${completedLessons}/${totalLessons} completed\n${lessonList}`;
          })
        );

        return Response.json({
          response: `## 📖 Your Lessons\n\n${lessonBlocks.join("\n\n")}${enrollments.length > 2 ? `\n\n_...and ${enrollments.length - 2} more course${enrollments.length - 2 > 1 ? "s" : ""}_` : ""}\n\n💡 **Tip:** Try to complete lessons in order for the best learning progression. Each lesson builds on the previous one!`,
        });
      }

      /* ──────────────────── STUDY TIPS ──────────────────── */

      case "TIPS": {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                modules: {
                  include: { lessons: { select: { id: true } } },
                },
              },
            },
          },
        });

        let tipContext = "";

        if (enrollments.length > 0) {
          const totalLessons = enrollments.reduce((sum, e) => sum + e.course.modules.reduce((s, m) => s + m.lessons.length, 0), 0);
          const completedLessons = (await Promise.all(
            enrollments.map(async (e) => {
              const ids = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
              return prisma.progress.count({ where: { userId, lessonId: { in: ids }, status: "COMPLETED" } });
            })
          )).reduce((a, b) => a + b, 0);

          const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          tipContext = `\n\nBased on your current progress (**${pct}%** overall):\n`;
          if (pct < 25) tipContext += `• 🎯 **Focus on consistency** — Try completing 1 lesson per day to build a study habit.\n• 📝 **Take notes** while studying to improve retention.\n• 🔄 **Review** completed lessons periodically.`;
          else if (pct < 50) tipContext += `• 📈 **Great momentum!** — You're building a solid study routine.\n• 🧠 **Active recall** — Try explaining concepts to yourself without looking.\n• ⏰ **Space out** your study sessions for better long-term memory.`;
          else if (pct < 75) tipContext += `• 💪 **Impressive dedication!** — You're more than halfway there.\n• 🏆 **Set small goals** — Aim to complete the next module this week.\n• 🤝 **Discuss** what you've learned with peers to deepen understanding.`;
          else tipContext += `• 🚀 **Almost there!** — You're so close to finishing.\n• 🎯 **Push through** — The final stretch is always the hardest.\n• ✅ **Review weak areas** — Focus on lessons where your scores were lower.`;
        } else {
          tipContext = "\n\n• 🎯 **Start with a course** that matches your interests.\n• 📅 **Set a schedule** — Even 15 minutes a day makes a difference.\n• 📝 **Take notes** from the very first lesson.\n• 🏆 **Track achievements** to stay motivated.";
        }

        const tips = [
          "**Active Learning**: Don't just read — take notes, ask questions, and apply concepts.",
          "**Consistent Schedule**: Study at the same time each day to build a habit.",
          "**Take Breaks**: Use the Pomodoro technique — 25 min study, 5 min break.",
          "**Review Regularly**: Go back to previous lessons to reinforce knowledge.",
          "**Stay Organized**: Use the Notes feature to keep your study materials in one place.",
          "**Set Goals**: Break large courses into small, achievable milestones.",
          "**Teach Others**: Explaining concepts to someone else is the best way to learn.",
          "**Use Multiple Formats**: Combine videos, articles, and quizzes for better retention.",
        ];

        const randomTips = tips.sort(() => Math.random() - 0.5).slice(0, 3);

        return Response.json({
          response: `## 💡 Personalized Study Tips${tipContext}\n\n**Quick Study Strategies:**\n${randomTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n📚 *Every expert was once a beginner. Keep going!*`,
        });
      }

      /* ──────────────────── VR/AR ──────────────────── */

      case "VR_AR": {
        return Response.json({
          response: `## 🥽 VR & AR Explained\n\nBoth VR and AR are immersive technologies that change how we interact with digital content:\n\n### Virtual Reality (VR)\n**VR** creates a completely artificial, computer-generated environment that replaces the real world.\n• You wear a **headset** (like Meta Quest, HTC Vive) that blocks out your surroundings\n• You are **fully immersed** in a 3D digital world\n• Used for: immersive learning, training simulations, gaming, virtual tours\n• Example on this platform: Exploring the human body in 3D, conducting lab experiments\n\n### Augmented Reality (AR)\n**AR** overlays digital content onto the real world — it adds to your reality, not replaces it.\n• Works through your **phone camera or smart glasses** (like AR posters on this platform)\n• Digital objects appear **anchored to real-world surfaces**\n• Used for: interactive posters, furniture preview, navigation, education\n• Example on this platform: Scan an AR poster to see a 3D model appear in your room\n\n### Key Differences\n\n| Aspect | VR | AR |\n|--------|----|----|\n| Environment | Fully digital | Real world + digital overlay |\n| Immersion | Complete | Partial |\n| Hardware | Headset required | Phone/tablet/glasses |\n| Presence | You're inside the virtual world | Virtual objects in your world |\n\n### 🎓 On STEAM ELMS\nWe use **VR** for courses and virtual labs where you can interact with 3D environments.\nWe use **AR** for posters and campus features that bring learning into your physical space.\n\n*Think of VR as stepping into a new world, and AR as bringing that world to you.*`,
        });
      }

      /* ──────────────────── UNKNOWN ──────────────────── */

      default: {
        return Response.json({
          response: `I'm not sure I understand that yet. 🤔\n\nHere are some things you can ask me:\n\n      • **"Show available courses"** — Browse course catalog\n• **"My progress"** — Track your learning\n• **"My grades"** — View your scores\n• **"My achievements"** — Check badges\n• **"What is VR?"** — Learn about VR and AR\n• **"Study tips"** — Get learning advice\n• **"Help"** — See all commands\n\nType **help** anytime to see the full list of what I can do! 🎓`,
        });
      }
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    return Response.json({
      response: "I apologize, but I encountered a technical issue. Please try again in a moment. If the problem persists, contact support. 🛠️",
    });
  }
}
