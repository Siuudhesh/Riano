"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface Student {
  id: string;
  name: string;
  cycleProgress: string;
  status: string;
  paymentStatus: string;
}

export default function AdminDashboard() {
  // 1. All State Variables
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  const [greeting, setGreeting] = useState("Hi, Riyana ✨");

  // 2. Fetch Students Function
  const fetchStudents = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/students?t=${timestamp}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 3. The On-Load Magic (Greeting + Fetching)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning, beautiful! Have a great day ✨");
    } else if (hour < 17) {
      setGreeting("Hope your classes are going perfectly! 🎹");
    } else {
      setGreeting("So proud of how hard you worked today! 🌙");
    }

    fetchStudents();
  }, []);

  // 4. The Secret Easter Egg Function
  const handleHeaderTap = () => {
    if (secretTapCount + 1 === 2) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#ff0000', '#ff69b4', '#ff1493', '#fff0f5'] 
      });
      setShowSecretMessage(true);
      setSecretTapCount(0);
    } else {
      setSecretTapCount(secretTapCount + 1);
    }
  };

  // 5. Mark Attendance Function
  const markAttendance = async (studentId: string) => {
    setLoadingId(studentId);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();

      if (response.ok) {
        if (typeof window !== "undefined" && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }

        const newTotal = data.updatedTotal;
        const newCycleClass = ((newTotal - 1) % 4) + 1; 
        const newStatus = newCycleClass === 4 ? "SEND INVOICE" : "Active";
        
        setStudents((prev) => prev.map((s) => {
          if (s.id === studentId) {
            const updatedPaymentStatus = newCycleClass === 1 ? "Pending" : s.paymentStatus;
            return { ...s, cycleProgress: `Class ${newCycleClass} of 4`, status: newStatus, paymentStatus: updatedPaymentStatus };
          }
          return s;
        }));
      } else {
        alert("Failed to update attendance.");
      }
    } catch (error) {
      alert("Failed to connect to the server.");
    } finally {
      setLoadingId(null);
    }
  };

  // 6. Mark As Paid Function
  const markAsPaid = async (studentId: string) => {
    setLoadingId(`pay-${studentId}`);
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        if (typeof window !== "undefined" && window.navigator.vibrate) {
          window.navigator.vibrate([100, 50, 100]);
        }

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#14b8a6', '#fcd34d']
        });

        setStudents((prev) => prev.map((s) => 
          s.id === studentId ? { ...s, paymentStatus: "Paid" } : s
        ));
      } else {
        alert("Failed to mark as paid.");
      }
    } catch (error) {
      alert("Failed to connect to the server.");
    } finally {
      setLoadingId(null);
    }
  };

  // 7. The UI Render
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-6 font-sans">
      <div className="max-w-md mx-auto pt-8">
        
        {/* Personalized Header with Secret Tap */}
        <div className="mb-10 text-center">
          <h1 
            onClick={handleHeaderTap} 
            className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 cursor-pointer select-none transition-transform active:scale-95"
          >
            {greeting}
          </h1>
          <p className="text-slate-500 font-medium">Your Riano Studio Dashboard</p>
        </div>
        
        {isLoadingData ? (
          <div className="flex justify-center mt-20">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
              <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
              <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {students.map((student) => {
              const needsPayment = student.status === "SEND INVOICE" && student.paymentStatus !== "Paid";

              return (
                <div key={student.id} className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-700 mb-1">{student.name}</h2>
                      
                      {needsPayment ? (
                        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded-full shadow-sm">
                          Payment Due
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-white text-purple-500 text-xs font-bold rounded-full shadow-sm border border-purple-100">
                          {student.cycleProgress}
                        </span>
                      )}
                    </div>

                    {needsPayment ? (
                      <button
                        onClick={() => markAsPaid(student.id)}
                        disabled={loadingId === `pay-${student.id}`}
                        className="px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 shadow-md hover:shadow-lg active:scale-95 transition-all"
                      >
                        {loadingId === `pay-${student.id}` ? "..." : "Mark Paid"}
                      </button>
                    ) : (
                      <button
                        onClick={() => markAttendance(student.id)}
                        disabled={loadingId === student.id}
                        className={`px-6 py-2.5 rounded-full font-bold shadow-md active:scale-95 transition-all ${
                          loadingId === student.id 
                            ? "bg-slate-200 text-slate-400 shadow-none cursor-wait"
                            : "text-white bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg"
                        }`}
                      >
                        {loadingId === student.id ? "..." : "Attended"}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* --- THE SECRET ROMANTIC MODAL --- */}
        {showSecretMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-pink-100 transform transition-all scale-100">
              <div className="text-5xl mb-4 animate-bounce">❤️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Secret Unlocked!</h3>
              <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                Just a daily reminder: The developer of this app (me ofc) thinks you're the most amazing girl in the world! ✨
              </p>
              <button 
                onClick={() => setShowSecretMessage(false)}
                className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all w-full"
              >
                cut krle ladliiii! ❤️
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}