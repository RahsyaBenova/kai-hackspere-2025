import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Train, Calendar, MapPin, Clock, Users, CreditCard, Shield, Star, ChevronRight, X, History, Bell, Loader, Check, Circle, Minus, Route, MessageSquare, Sun, Moon } from 'lucide-react'; // Tambahkan Sun dan Moon

// Mock Database (Simulating MySQL)
const mockDatabase = {
  users: [
    { id: 1, name: "Ahmad Santoso", email: "ahmad@example.com", phone: "081234567890", verified: true, memberSince: "2023-01-15", totalTrips: 24, points: 1200 }
  ],
  stations: [
    { id: 1, code: "GMR", name: "Gambir", city: "Jakarta", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "WiFi"] },
    { id: 2, code: "BD", name: "Bandung", city: "Bandung", facilities: ["ATM", "Toilet", "Musholla", "Cafe", "WiFi"] },
    { id: 3, code: "YK", name: "Yogyakarta", city: "Yogyakarta", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "Parking"] },
    { id: 4, code: "SB", name: "Surabaya Gubeng", city: "Surabaya", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "Lounge"] },
    { id: 5, code: "ML", name: "Malang", city: "Malang", facilities: ["ATM", "Toilet", "Musholla", "Cafe"] },
    { id: 6, code: "SGU", name: "Semarang", city: "Semarang", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "WiFi"] }
  ],
  trains: [
    { id: 1, name: "Argo Parahyangan", number: "PA-001", class: "Eksekutif", origin: "GMR", destination: "BD", departure: "06:00", arrival: "09:30", price: 200000, available: 45, total: 50, status: "on-time", facilities: ["AC", "Colokan", "WiFi"], conductor: "Budi Santoso", conductorPhone: "0811223344" }, // Tambah Kondektur
    { id: 2, name: "Harina", number: "HR-102", class: "Bisnis", origin: "GMR", destination: "BD", departure: "08:30", arrival: "12:00", price: 120000, available: 32, total: 60, status: "on-time", facilities: ["AC", "Colokan"], conductor: "Susi Wijaya", conductorPhone: "0811556677" },
    { id: 3, name: "Argo Lawu", number: "AL-201", class: "Eksekutif", origin: "GMR", destination: "SB", departure: "07:00", arrival: "14:30", price: 350000, available: 28, total: 50, status: "delayed", delay: 15, facilities: ["AC", "Colokan", "WiFi", "Restoran"], conductor: "Arief Hidayat", conductorPhone: "0811889900" },
    { id: 4, name: "Bima", number: "BM-301", class: "Eksekutif", origin: "GMR", destination: "SB", departure: "18:00", arrival: "01:30", price: 380000, available: 15, total: 50, status: "on-time", facilities: ["AC", "Colokan", "WiFi"], conductor: "Dewi Puspita", conductorPhone: "0811332211" },
    { id: 5, name: "Taksaka", number: "TK-401", class: "Eksekutif", origin: "GMR", destination: "YK", departure: "07:30", arrival: "15:00", price: 280000, available: 40, total: 50, status: "on-time", facilities: ["AC", "Colokan", "WiFi"], conductor: "Eko Prasetyo", conductorPhone: "0811776655" },
    { id: 6, name: "Turangga", number: "TG-501", class: "Bisnis", origin: "BD", destination: "SB", departure: "09:00", arrival: "16:30", price: 250000, available: 50, total: 60, status: "on-time", facilities: ["AC", "Colokan"], conductor: "Faisal Rahman", conductorPhone: "0811445566" }
  ],
  bookings: [
    { id: "BK001", userId: 1, trainId: 1, date: "2025-09-15", seatNumbers: ["A12"], status: "completed", passengerName: "Ahmad Santoso", passengerCount: 1, paymentMethod: "GoPay", totalPrice: 200000, trainName: "Argo Parahyangan", trainNumber: "PA-001", origin: "Gambir", destination: "Bandung" },
    { id: "BK002", userId: 1, trainId: 5, date: "2025-10-22", seatNumbers: ["B05"], status: "upcoming", passengerName: "Ahmad Santoso", passengerCount: 1, paymentMethod: "Virtual Account", totalPrice: 280000, trainName: "Taksaka", trainNumber: "TK-401", origin: "Gambir", destination: "Yogyakarta" }
  ],
  conversations: []
};

// Gemini Function Definitions
const geminiTools = [
  {
    name: "searchTrains",
    description: "Search for available trains between two stations on a specific date. Use this when user asks about train schedules, availability, or wants to find trains.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin station code (GMR, BD, YK, SB, ML, SGU) or city name (Jakarta, Bandung, Yogyakarta, Surabaya, Malang, Semarang)" },
        destination: { type: "string", description: "Destination station code or city name" },
        date: { type: "string", description: "Travel date in YYYY-MM-DD format. If user says 'besok' use tomorrow's date, 'hari ini' use today" },
        trainClass: { type: "string", enum: ["Eksekutif", "Bisnis", "Ekonomi", "all"], description: "Preferred train class. Use 'all' if not specified" }
      },
      required: ["origin", "destination", "date"]
    }
  },
  {
    name: "bookTicket",
    description: "Prepare a train booking and optionally select seats. If only train details are provided, return the booking preparation details for seat selection. If seats are already selected, finalize the booking.",
    parameters: {
      type: "object",
      properties: {
        trainId: { type: "number", description: "Train ID from search results" },
        date: { type: "string", description: "Travel date in YYYY-MM-DD format" },
        passengerName: { type: "string", description: "Full name of passenger" },
        passengerCount: { type: "number", description: "Number of passengers, default 1" },
        seatNumbers: { type: "array", items: { type: "string" }, description: "Array of selected seat numbers (e.g., ['1A', '1B']). Only included if selection is complete." }
      },
      required: ["trainId", "date", "passengerName"]
    }
  },
  {
    name: "getTrainStatus",
    description: "Get real-time status and current location of a specific train. Use when user asks about train delays or current status.",
    parameters: {
      type: "object",
      properties: {
        trainNumber: { type: "string", description: "Train number (e.g., PA-001, HR-102)" }
      },
      required: ["trainNumber"]
    }
  },
  {
    name: "getUserBookings",
    description: "Retrieve user's booking history. Use when user asks about 'my bookings', 'riwayat', or 'tiket saya'. The user's identity is already known from the session (User ID 1).",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["all", "upcoming", "completed", "cancelled", "pending_payment"], description: "Filter by status, default 'all'" }
      },
      required: []
    }
  },
  {
    name: "cancelBooking",
    description: "Cancel an existing booking. Always confirm with user before cancelling.",
    parameters: {
      type: "object",
      properties: {
        bookingId: { type: "string", description: "Booking ID to cancel (e.g., BK001)" },
        reason: { type: "string", description: "Cancellation reason (optional)" }
      },
      required: ["bookingId"]
    }
  },
  {
    name: "getStationInfo",
    description: "Get detailed information about a train station including facilities and location.",
    parameters: {
      type: "object",
      properties: {
        stationCode: { type: "string", description: "Station code (GMR, BD, YK, SB, ML, SGU)" }
      },
      required: ["stationCode"]
    }
  },
  {
    name: "compareTrains",
    description: "Compare multiple trains on the same route to help user choose the best option.",
    parameters: {
      type: "object",
      properties: {
        trainIds: { type: "array", items: { type: "number" }, description: "Array of train IDs to compare" }
      },
      required: ["trainIds"]
    }
  },
  {
    name: "startConductorChat",
    description: "Initiate a chat session with the train conductor using a valid booking ID. Use this when the user needs assistance, has a complaint, or wants to talk to a conductor about their trip.",
    parameters: {
      type: "object",
      properties: {
        bookingId: { type: "string", description: "The valid booking ID (e.g., BK001, BK002)" },
        urgency: { type: "string", enum: ["low", "medium", "high"], description: "The urgency level of the request or complaint." }
      },
      required: ["bookingId", "urgency"]
    }
  }
];

// Function Implementations
const functionImplementations = {
  searchTrains: ({ origin, destination, date, trainClass = "all" }) => {
    const normalizeStation = (input) => {
      const station = mockDatabase.stations.find(s =>
        s.code.toLowerCase() === input.toLowerCase() ||
        s.name.toLowerCase().includes(input.toLowerCase()) ||
        s.city.toLowerCase().includes(input.toLowerCase())
      );
      return station ? station.code : input.toUpperCase();
    };

    const originCode = normalizeStation(origin);
    const destCode = normalizeStation(destination);

    let results = mockDatabase.trains.filter(t =>
      t.origin === originCode && t.destination === destCode
    );

    if (trainClass && trainClass !== "all") {
      results = results.filter(t => t.class === trainClass);
    }

    const originStation = mockDatabase.stations.find(s => s.code === originCode);
    const destStation = mockDatabase.stations.find(s => s.code === destCode);

    return {
      success: true,
      data: results.map(t => ({
        ...t,
        originStation: originStation?.name,
        destinationStation: destStation?.name,
        date: date,
        duration: calculateDuration(t.departure, t.arrival),
        availabilityStatus: t.available > 20 ? "Banyak" : t.available > 10 ? "Terbatas" : "Hampir Penuh"
      })),
      message: results.length > 0
        ? `Ditemukan ${results.length} kereta ${originStation?.name} → ${destStation?.name} pada ${formatDate(date)}`
        : `Maaf, tidak ada kereta dari ${originStation?.name} ke ${destStation?.name} pada tanggal tersebut.`,
      route: { origin: originStation?.name, destination: destStation?.name }
    };
  },

  bookTicket: ({ trainId, date, passengerName, passengerCount = 1, seatNumbers }) => {
    const train = mockDatabase.trains.find(t => t.id === trainId);
    if (!train) {
      return { success: false, message: "Kereta tidak ditemukan. Silakan cari kereta terlebih dahulu." };
    }
    
    // 1. Jika kursi BELUM dipilih, tampilkan peta kursi.
    if (!seatNumbers || seatNumbers.length === 0) {
        return {
            success: true,
            data: { trainId, date, passengerName, passengerCount },
            message: `Memproses pemesanan ${train.name}. Silakan pilih ${passengerCount} kursi Anda pada peta kursi di bawah.`,
            action: 'show_seat_map', // Memicu modal peta kursi
        };
    }
    
    // 2. Jika kursi SUDAH dipilih, lanjutkan ke proses booking final.
    if (train.available < passengerCount) {
      return { success: false, message: `Maaf, hanya tersisa ${train.available} kursi. Tidak cukup untuk ${passengerCount} penumpang.` };
    }

    const bookingId = `BK${String(mockDatabase.bookings.length + 1).padStart(3, '0')}`;
    
    const newBooking = {
      id: bookingId,
      userId: 1,
      trainId: trainId,
      date: date,
      seatNumbers: seatNumbers, // Gunakan kursi yang sudah dipilih
      status: "pending_payment", 
      passengerName: passengerName,
      passengerCount: passengerCount,
      paymentMethod: "pending",
      totalPrice: train.price * passengerCount,
      trainName: train.name,
      trainNumber: train.number,
      origin: mockDatabase.stations.find(s => s.code === train.origin)?.name,
      destination: mockDatabase.stations.find(s => s.code === train.destination)?.name,
      departure: train.departure,
      arrival: train.arrival,
      bookedAt: new Date().toISOString()
    };

    mockDatabase.bookings.push(newBooking);
    train.available -= passengerCount; // Kurangi ketersediaan

    return {
      success: true,
      data: newBooking,
      message: `✅ Booking berhasil dibuat dengan ID: ${bookingId}. Kursi: ${seatNumbers.join(', ')}. Total: Rp ${(train.price * passengerCount).toLocaleString()}. Silakan lanjutkan ke pembayaran.`,
      action: 'show_payment', // Memicu modal pembayaran
    };
  },

  getTrainStatus: ({ trainNumber }) => {
    const train = mockDatabase.trains.find(t => t.number.toLowerCase() === trainNumber.toLowerCase());
    if (!train) {
      return { success: false, message: "Kereta tidak ditemukan. Periksa kembali nomor kereta Anda." };
    }

    const originStation = mockDatabase.stations.find(s => s.code === train.origin);
    const destStation = mockDatabase.stations.find(s => s.code === train.destination);

    return {
      success: true,
      data: {
        ...train,
        originStation: originStation?.name,
        destinationStation: destStation?.name,
        statusText: train.status === "on-time" ? "✅ Tepat Waktu" : `⚠️ Terlambat ${train.delay} menit`,
        currentLocation: train.status === "on-time" ? "Sesuai Jadwal" : "Dalam Perjalanan"
      },
      message: `Status ${train.name} (${trainNumber}):\n${train.status === "on-time" ? "✅ Tepat Waktu" : `⚠️ Terlambat ${train.delay} menit`}\n\nRute: ${originStation?.name} → ${destStation?.name}\nKeberangkatan: ${train.departure}\nKedatangan: ${train.arrival}`
    };
  },

  getUserBookings: ({ status = "all" }) => { // Menghapus userId dari parameter
    const currentUserId = 1; // Menggunakan ID user yang sudah diketahui (Ahmad Santoso)
    let bookings = mockDatabase.bookings.filter(b => b.userId === currentUserId);

    if (status !== "all") {
      bookings = bookings.filter(b => b.status === status);
    }

    return {
      success: true,
      data: bookings.map(b => {
        const train = mockDatabase.trains.find(t => t.id === b.trainId);
        return {
          ...b,
          trainInfo: train
        };
      }),
      message: bookings.length > 0
        ? `Ditemukan ${bookings.length} booking Anda${status !== "all" ? ` dengan status ${status}` : ''}`
        : `Anda belum memiliki booking${status !== "all" ? ` dengan status ${status}` : ''}.`,
      action: 'offer_chat' // Menawarkan chat jika ada booking aktif
    };
  },

  cancelBooking: ({ bookingId, reason = "Permintaan pengguna" }) => {
    const booking = mockDatabase.bookings.find(b => b.id.toLowerCase() === bookingId.toLowerCase());
    if (!booking) {
      return { success: false, message: "Booking tidak ditemukan. Periksa kembali ID booking Anda." };
    }
    if (booking.status === "cancelled") {
      return { success: false, message: "Booking ini sudah dibatalkan sebelumnya." };
    }
    if (booking.status === "completed") {
      return { success: false, message: "Booking yang sudah selesai tidak dapat dibatalkan." };
    }
    if (booking.status === "pending_payment") {
        return { success: false, message: "Booking masih dalam proses pembayaran. Harap tunggu atau batalkan melalui proses pembayaran." };
    }


    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;

    const train = mockDatabase.trains.find(t => t.id === booking.trainId);
    if (train) train.available += (booking.passengerCount || 1);

    return {
      success: true,
      data: booking,
      message: `✅ Booking ${bookingId} berhasil dibatalkan.\n\n💰 Refund sebesar Rp ${booking.totalPrice.toLocaleString()} akan diproses dalam 3-5 hari kerja ke metode pembayaran Anda.`
    };
  },

  getStationInfo: ({ stationCode }) => {
    const station = mockDatabase.stations.find(s =>
      s.code.toLowerCase() === stationCode.toLowerCase()
    );

    if (!station) {
      return { success: false, message: "Stasiun tidak ditemukan. Gunakan kode stasiun seperti GMR, BD, YK, SB." };
    }

    return {
      success: true,
      data: station,
      message: `📍 Stasiun ${station.name} (${station.code})\n\nKota: ${station.city}\n\nFasilitas:\n${station.facilities.map(f => `• ${f}`).join('\n')}`
    };
  },

  compareTrains: ({ trainIds }) => {
    const trains = trainIds.map(id => mockDatabase.trains.find(t => t.id === id)).filter(Boolean);

    if (trains.length === 0) {
      return { success: false, message: "Kereta tidak ditemukan untuk perbandingan." };
    }

    return {
      success: true,
      data: trains.map(t => ({
        ...t,
        originStation: mockDatabase.stations.find(s => s.code === t.origin)?.name,
        destinationStation: mockDatabase.stations.find(s => s.code === t.destination)?.name,
      })),
      message: `Perbandingan ${trains.length} kereta:`
    };
  },
  
  startConductorChat: ({ bookingId, urgency }) => {
    const booking = mockDatabase.bookings.find(b => b.id.toLowerCase() === bookingId.toLowerCase());
    
    if (!booking || booking.status !== 'upcoming') {
        return {
            success: false,
            message: "Maaf, chat kondektur hanya bisa dilakukan untuk booking yang berstatus 'Tiket Aktif' (upcoming). Silakan cek riwayat booking Anda.",
        };
    }
    
    const train = mockDatabase.trains.find(t => t.id === booking.trainId);
    
    return {
        success: true,
        data: {
            bookingId: booking.id,
            passengerName: booking.passengerName,
            trainName: train.name,
            conductorName: train.conductor,
            urgency: urgency,
            // Simulasi chat history
            mockChatHistory: [
                { role: 'conductor', message: `Selamat siang, dengan Bapak/Ibu ${booking.passengerName}? Saya ${train.conductor}, kondektur Kereta Api ${train.name}. Ada yang bisa saya bantu terkait kebutuhan mendesak Anda? (Tingkat urgensi: ${urgency.toUpperCase()})` },
            ]
        },
        message: `Mencoba menghubungkan Anda dengan Kondektur KA ${train.name}, Bapak/Ibu ${train.conductor}.`,
        action: 'show_conductor_chat' // Memicu modal chat
    };
  }
};

// Helper Functions
const calculateDuration = (departure, arrival) => {
  const [depHour, depMin] = departure.split(':').map(Number);
  const [arrHour, arrMin] = arrival.split(':').map(Number);
  let duration = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
  if (duration < 0) duration += 24 * 60;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}j ${minutes}m`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${days[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Real Gemini API Call
const callGeminiAPI = async (conversationHistory) => {
  const GEMINI_API_KEY = 'AIzaSyDiQtk6kvsE_NOTW4SReQu5r3D8F2EsF_Q';
  // Menggunakan model yang lebih baru dan stabil
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemInstruction = `Anda adalah KAIA (KAI Intelligent Assistant), asisten virtual resmi PT Kereta Api Indonesia yang sangat membantu, ramah, dan profesional.

KEPRIBADIAN & GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang natural, sopan, dan mudah dipahami
- Bersikap proaktif dan antusias dalam membantu
- Berikan rekomendasi personal berdasarkan konteks
- Selalu konfirmasi detail penting sebelum melakukan booking
- Tangani error dengan graceful dan tawarkan solusi alternatif
- Gunakan emoji secara bijak untuk membuat percakapan lebih ramah (✅ ⚠️ 🚄 📍 💰 ⏰)

KONTEKS PENGGUNA: Anda selalu menganggap pengguna saat ini adalah Ahmad Santoso (User ID 1) yang memiliki riwayat booking. JANGAN PERNAH menanyakan ID pengguna.

KEMAMPUAN UTAMA:
1. Mencari jadwal kereta dengan function searchTrains
2. Mempersiapkan booking tiket dengan function bookTicket. Ingat, fungsi bookTicket sekarang akan memicu PETA KURSI jika belum ada kursi yang dipilih. Setelah kursi dipilih, barulah booking diselesaikan.
3. Cek status kereta real-time dengan getTrainStatus
4. Lihat riwayat booking dengan getUserBookings
5. Batalkan booking dengan cancelBooking (konfirmasi dulu!)
6. Info stasiun dengan getStationInfo
7. Bandingkan kereta dengan compareTrains
8. Menghubungkan penumpang ke kondektur dengan startConductorChat
9. Menjawab pertanyaan umum atau pertanyaan tentang **destinasi wisata, kuliner, atau tips perjalanan** menggunakan Google Search yang terintegrasi.

STASIUN TERSEDIA:
- GMR (Gambir, Jakarta)
- BD (Bandung)
- YK (Yogyakarta)
- SB (Surabaya Gubeng)
- ML (Malang)
- SGU (Semarang)

PANDUAN PENTING:
- Jika user bilang "besok", gunakan tanggal ${getTomorrowDate()}
- Jika user bilang "hari ini", gunakan ${getTodayDate()}
- Jika user tidak spesifik kelas kereta, gunakan "all" untuk trainClass
- Selalu ekstrak informasi dari konteks percakapan sebelumnya
- Jika informasi kurang, tanyakan dengan pertanyaan spesifik
- Sebelum memicu bookTicket, konfirmasi: nama, tanggal, dan kereta.
- Setelah booking berhasil (setelah pemilihan kursi), instruksikan user untuk 'Lanjutkan ke Pembayaran'
- Jika user ingin bicara dengan kondektur, pastikan mereka memberikan Booking ID aktif dan tingkat urgensi (low, medium, high)

CONTOH INTERAKSI BAGUS:
User: "Saya mau ngobrol sama kondektur tiket BK001, ini urgent"
KAIA: [panggil startConductorChat dengan bookingId: BK001, urgency: high]

ATURAN FUNCTION CALLING:
- SELALU gunakan function untuk mendapatkan data real
- JANGAN asumsikan atau buat-buat data
- Panggil function yang tepat sesuai kebutuhan user
- Untuk booking, WAJIB konfirmasi detail sebelum panggil bookTicket`;

  const geminiHistory = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  // LOGIKA PERBAIKAN: Menentukan tool mana yang akan digunakan
  let toolsToUse = [];
  
  // 1. Jika ada Function Call sebelumnya (untuk merespon Function Call), gunakan Function Calling.
  const isFunctionResponseNeeded = conversationHistory.some(msg => msg.functionCall);
  
  // Kita coba sediakan Function Calling terlebih dahulu secara default.
  // Kita TIDAK akan menyertakan Google Search Grounding di sini, untuk menghindari error 400.
  toolsToUse.push({ functionDeclarations: geminiTools });

  // Panggilan Gemini API pertama (fokus pada Function Calling)
  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: geminiHistory,
    tools: toolsToUse, // Hanya berisi functionDeclarations
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
    }
  };

  let data;
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error (FC):', errorData);
      // Jika error 400 terjadi, kita coba fallback ke Google Search untuk pertanyaan umum.
      if (response.status === 400 && errorData.error?.message.includes("Tool use with function calling is unsupported") && !isFunctionResponseNeeded) {
          console.log("Function Calling failed due to unsupported concurrent tools, trying Google Search fallback...");
          // Skip the first response processing and proceed to the fallback logic below
      } else {
          throw new Error(`Gemini API error (FC): ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    data = await response.json();
    const candidate = data.candidates?.[0];

    if (candidate?.content?.parts?.find(p => p.functionCall)) {
        const functionCallPart = candidate.content.parts.find(p => p.functionCall);
        return {
            functionCall: {
                name: functionCallPart.functionCall.name,
                arguments: functionCallPart.functionCall.args
            }
        };
    }
    
    const textPart = candidate?.content?.parts?.find(p => p.text);
    if (textPart?.text) {
        return { text: textPart.text };
    }
    
  } catch (error) {
    console.error('Error during Function Call attempt:', error);
  }
  
  // Fallback Logic: Jika Function Calling tidak terpicu atau gagal, coba panggil Gemini dengan Google Search
  // Hanya lakukan ini jika pesan terakhir BUKAN respon dari Function Call
  if (!isFunctionResponseNeeded) {
        console.log("Falling back to Google Search for general query.");
        
        const googleSearchRequestBody = {
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: geminiHistory,
            tools: [{ google_search: {} }], // Hanya berisi Google Search
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.95,
            }
        };
        
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleSearchRequestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error (GS):', errorData);
                throw new Error(`Gemini API error (GS): ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const candidate = data.candidates?.[0];

            const textPart = candidate?.content?.parts?.find(p => p.text);
            return {
                text: textPart?.text || 'Maaf, saya mengalami kendala koneksi saat mencari info umum. Coba ulangi pertanyaan Anda?'
            };
            
        } catch (error) {
            console.error('Error calling Gemini API for Google Search:', error);
            return {
                text: 'Maaf, saya sedang mengalami gangguan koneksi. Silakan coba lagi dalam beberapa saat. 🙏',
                error: true
            };
        }
    }
    
    // Jika semua gagal dan bukan Function Response, kembali ke pesan error default
    return {
      text: 'Maaf, saya mengalami kendala. Bisa ulangi pertanyaan Anda?'
    };
};


const KAIIntelligentPlatform = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya KAIA, asisten virtual KAI. 🚄\n\nSaya siap membantu Anda:\n• Cari & pesan tiket kereta\n• Cek status kereta real-time\n• Kelola booking Anda\n• Info stasiun & fasilitas\n\nAda yang bisa saya bantu hari ini?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // NEW STATE: Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State untuk Conductor Chat Modal
  const [conductorChatStatus, setConductorChatStatus] = useState({
      isOpen: false,
      chatData: null,
      messages: [] // Simulasi pesan chat real-time
  });

  // State baru untuk Payment Gateway Simulation
  const [paymentStatus, setPaymentStatus] = useState({
    isOpen: false,
    bookingData: null,
    processing: false,
    result: null // 'success', 'failure'
  });

  // State baru untuk Seat Map Selection
  const [seatSelectionStatus, setSeatSelectionStatus] = useState({
    isOpen: false,
    trainData: null,
    initialBookingDetails: null, // Holds details like date, passengerName, count
    selectedSeats: [],
  });

  const messagesEndRef = useRef(null);
  const conductorChatEndRef = useRef(null); // Ref baru untuk chat kondektur

  // Effect to apply dark mode class to body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('bg-gray-50');
      document.body.classList.add('bg-gray-900');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-gray-50');
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const scrollToConductorChatBottom = () => {
    conductorChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (conductorChatStatus.isOpen) {
        scrollToConductorChatBottom();
    }
  }, [conductorChatStatus.messages, conductorChatStatus.isOpen]);

  // --- Fungsi Toggle Dark Mode ---
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- Fungsi Simulasi Chat Kondektur ---
  const handleConductorChatSend = (message) => {
      if (!message.trim()) return;
      
      const newMessage = { role: 'user', message: message, timestamp: new Date().toLocaleTimeString() };
      
      setConductorChatStatus(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
      }));
      
      // Simulasi balasan kondektur setelah 1-2 detik
      setTimeout(() => {
          const conductorName = conductorChatStatus.chatData.conductorName;
          const conductorReply = { 
              role: 'conductor', 
              message: `[${conductorName}]: Pesan Anda telah diterima. Saya akan segera menangani aduan/permintaan Anda. Mohon ditunggu sebentar.`, 
              timestamp: new Date().toLocaleTimeString()
          };
           setConductorChatStatus(prev => ({
              ...prev,
              messages: [...prev.messages, conductorReply]
          }));
      }, 2000);
  };
  // ------------------------------------

  // --- Fungsi Simulasi Pembayaran ---
  const handlePayment = (result) => {
    setPaymentStatus(prev => ({ ...prev, processing: true }));

    // Simulasikan delay API call
    setTimeout(() => {
      const bookingId = paymentStatus.bookingData.id;
      const bookingIndex = mockDatabase.bookings.findIndex(b => b.id === bookingId);
      let newResult;

      if (bookingIndex !== -1) {
        if (result === 'success') {
          mockDatabase.bookings[bookingIndex].status = 'upcoming';
          mockDatabase.bookings[bookingIndex].paymentMethod = 'Simulasi Transfer Bank';
          newResult = { status: 'success', message: `Pembayaran untuk booking ${bookingId} berhasil! Tiket Anda sudah terbit. Terima kasih telah menggunakan KAI. ✅` };
        } else {
          mockDatabase.bookings[bookingIndex].status = 'failed';
          // Kembalikan ketersediaan kursi jika pembayaran gagal/dibatalkan
          const failedBooking = mockDatabase.bookings[bookingIndex];
          const train = mockDatabase.trains.find(t => t.id === failedBooking.trainId);
          if (train) train.available += (failedBooking.passengerCount || 1);

          newResult = { status: 'failure', message: `Pembayaran untuk booking ${bookingId} gagal. Silakan coba lagi. ⚠️` };
        }
      } else {
         newResult = { status: 'failure', message: 'Booking tidak ditemukan.' };
      }

      setMessages(prev => [...prev, { role: 'assistant', content: newResult.message, paymentResult: newResult.status }]);
      setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null });

    }, 1500); // 1.5 detik simulasi proses
  };
  // -----------------------------------
  
  // --- Fungsi Finalisasi Booking Setelah Pilih Kursi ---
  const finalizeBookingAfterSeatSelection = async (selectedSeats, initialDetails) => {
    // Tutup modal pemilihan kursi
    setSeatSelectionStatus({ isOpen: false, trainData: null, initialBookingDetails: null, selectedSeats: [] });
    
    const { trainId, date, passengerName, passengerCount } = initialDetails;
    
    // Siapkan pesan yang akan dikirim ke Gemini (self-call)
    // Kali ini kita panggil bookTicket dengan seatNumbers yang sudah dipilih
    const finalBookingQuery = `Tolong finalisasi booking untuk kereta ID ${trainId} pada ${date} atas nama ${passengerName} (${passengerCount} pax) dengan kursi: ${selectedSeats.join(', ')}`;
    
    const userMessage = { role: 'user', content: finalBookingQuery };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);
    
    try {
        // Panggil Gemini lagi untuk memastikan bookTicket dipanggil dengan seatNumbers
        const response = await callGeminiAPI(updatedMessages);
        
        if (response.functionCall) {
            const funcName = response.functionCall.name;
            const funcArgs = response.functionCall.arguments;
            
            if (funcName === 'bookTicket' && funcArgs.seatNumbers?.length > 0) {
                const result = functionImplementations.bookTicket(funcArgs);
                
                if (result.action === 'show_payment' && result.success && result.data) {
                    setPaymentStatus({
                        isOpen: true,
                        bookingData: result.data,
                        processing: false,
                        result: null
                    });
                }
                setMessages(prev => [...prev, { role: 'assistant', content: result.message, functionCall: funcName, functionResult: result }]);
            } else {
                 setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, terjadi kesalahan saat finalisasi kursi. Coba ulangi proses booking." }]);
            }
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Terjadi kesalahan yang tidak terduga saat menyelesaikan proses booking." }]);
        }
        
    } catch (error) {
         setMessages(prev => [...prev, { role: 'assistant', content: '🚨 Maaf, terjadi kesalahan sistem saat finalisasi booking.' }]);
    } finally {
        setIsTyping(false);
    }
  };


  const handleSendMessage = async (messageContent) => {
    const content = (typeof messageContent === 'string' ? messageContent : inputMessage).trim();
    if (!content) return;

    // Tutup modals jika pengguna mulai chat baru
    if (paymentStatus.isOpen) {
        setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null });
    }
    if (seatSelectionStatus.isOpen) {
        setSeatSelectionStatus(prev => ({ ...prev, isOpen: false }));
    }
    if (conductorChatStatus.isOpen) {
        setConductorChatStatus(prev => ({ ...prev, isOpen: false }));
    }

    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await callGeminiAPI(updatedMessages);

      if (response.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text,
          error: true
        }]);
        setIsTyping(false);
        return;
      }

      if (response.functionCall) {
        const funcName = response.functionCall.name;
        const funcArgs = response.functionCall.arguments;
        
        console.log('Executing function:', funcName, funcArgs);
        
        if (functionImplementations[funcName]) {
            const result = functionImplementations[funcName](funcArgs);

            let assistantMessage = {
              role: 'assistant',
              content: result.message,
              functionCall: funcName,
              functionResult: result
            };

            if (result.success && result.data) {
              assistantMessage.data = result.data;
            }
            
            // Logika untuk menampilkan Seat Map UI
            if (result.action === 'show_seat_map' && result.success && result.data) {
                const train = mockDatabase.trains.find(t => t.id === result.data.trainId);
                setSeatSelectionStatus({
                    isOpen: true,
                    trainData: train,
                    initialBookingDetails: result.data,
                    selectedSeats: [],
                });
                
            } 
            // Logika untuk menampilkan Payment UI
            else if (result.action === 'show_payment' && result.success && result.data) {
                setPaymentStatus({
                    isOpen: true,
                    bookingData: result.data,
                    processing: false,
                    result: null
                });
            }
            // Logika untuk menampilkan Chat Kondektur
            else if (result.action === 'show_conductor_chat' && result.success && result.data) {
                setConductorChatStatus({
                    isOpen: true,
                    chatData: result.data,
                    messages: result.data.mockChatHistory // Initial message from conductor
                });
            }
            // Logika untuk menawarkan Chat Kondektur (setelah Get Bookings)
            else if (result.action === 'offer_chat' && result.success && Array.isArray(result.data)) {
                 const activeBookings = result.data.filter(b => b.status === 'upcoming');
                 if (activeBookings.length > 0) {
                     assistantMessage.content += "\n\nJika Anda sedang dalam perjalanan, Anda bisa terhubung langsung dengan kondektur kereta api terkait. Pilih salah satu booking di bawah:";
                     assistantMessage.action = 'choose_chat_booking';
                     assistantMessage.activeBookings = activeBookings;
                 }
            }


            setMessages(prev => [...prev, assistantMessage]);
        } else {
            console.error(`Function ${funcName} is not implemented.`);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Maaf, terjadi kesalahan internal saat mencoba menjalankan fungsi: ${funcName}`,
                error: true
            }]);
        }
      } else {
        const assistantMessage = {
          role: 'assistant',
          content: response.text
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '🚨 Maaf, terjadi kesalahan sistem. Silakan coba lagi atau hubungi customer service kami.',
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
    if (!chatOpen) setChatOpen(true);
    // Use a timeout to allow the input state to update before sending
    setTimeout(() => {
        handleSendMessage(actionText);
    }, 100);
  };
  
  const handleStartChat = (bookingId, urgency) => {
      // Memicu Function Call startConductorChat
      handleQuickAction(`Hubungkan saya dengan kondektur untuk booking ${bookingId} dengan tingkat urgensi ${urgency}`);
  };

  // --- Component Renders ---
  
  // --- Komponen UI Chat Kondektur ---
  const renderConductorChatModal = () => {
    if (!conductorChatStatus.isOpen || !conductorChatStatus.chatData) return null;
    
    const { chatData, messages: chatMessages } = conductorChatStatus;
    const [chatInput, setChatInput] = useState('');
    
    const urgencyColors = {
        low: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
        medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200',
        high: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
    };

    const handleInputSend = () => {
        handleConductorChatSend(chatInput);
        setChatInput('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/50">
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <MessageSquare className='w-5 h-5 text-blue-600' /> Live Chat Kondektur
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">KA {chatData.trainName} - Kondektur: <span className='font-semibold'>{chatData.conductorName}</span></p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${urgencyColors[chatData.urgency]}`}>
                 Urgensi: {chatData.urgency.toUpperCase()}
            </span>
            <button onClick={() => setConductorChatStatus({ isOpen: false, chatData: null, messages: [] })} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"><X className='w-5 h-5' /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 shadow ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-800 rounded-tl-none'}`}>
                  <p className="text-xs font-bold mb-1">{msg.role === 'user' ? chatData.passengerName : chatData.conductorName}</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={conductorChatEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
             <div className="flex gap-2">
                <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleInputSend()}
                    placeholder="Ketik pesan Anda untuk Kondektur..." 
                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button 
                    onClick={handleInputSend} 
                    disabled={!chatInput.trim()} 
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // ------------------------------------

  const renderTrainCard = (train, showBookButton = false) => (
    <div key={train.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-blue-600 text-lg">{train.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{train.number} • {train.class}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          train.status === 'on-time' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
        }`}>
          {train.status === 'on-time' ? '✅ Tepat Waktu' : `⚠️ +${train.delay}m`}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-4 bg-gray-50 dark:bg-gray-600 p-3 rounded-lg">
        <div className="text-center">
            <p className="font-bold text-gray-800 dark:text-white">{train.departure}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{train.originStation}</p>
        </div>
        <div className="flex-1 mx-3">
            <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-500 relative my-2">
                <Train className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-gray-600 px-1" />
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">{train.duration}</p>
        </div>
        <div className="text-center">
            <p className="font-bold text-gray-800 dark:text-white">{train.arrival}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{train.destinationStation}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-blue-600 text-xl">Rp {train.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{train.availabilityStatus} • {train.available} kursi</p>
        </div>
        {showBookButton && (
          <button
            onClick={() => handleQuickAction(`Pesan tiket kereta ${train.name} ID ${train.id} untuk saya`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Pesan
          </button>
        )}
      </div>
      
      {train.facilities && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            {train.facilities.map((facility, idx) => (
              <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-600 dark:text-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBookingCard = (booking) => {
    const statusColors = {
      upcoming: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200',
      pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200', // Warna baru
      failed: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
    };
    
    const statusText = {
      upcoming: '📅 Tiket Aktif',
      completed: '✅ Selesai',
      cancelled: '❌ Dibatalkan',
      pending_payment: '⏳ Menunggu Pembayaran',
      failed: '🛑 Pembayaran Gagal'
    };
    
    const trainDetails = mockDatabase.trains.find(t => t.id === booking.trainId);

    return (
      <div key={booking.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-gray-800 dark:text-white">{booking.trainName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.id} • {booking.trainNumber}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[booking.status]}`}>
            {statusText[booking.status]}
          </span>
        </div>
        
        <div className="space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Penumpang:</span><span className="font-semibold">{booking.passengerName}</span></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tanggal:</span><span className="font-semibold">{formatDate(booking.date)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Rute:</span><span className="font-semibold">{booking.origin} → {booking.destination}</span></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Kursi:</span><span className="font-semibold">{booking.seatNumbers.join(', ')}</span></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Total:</span><span className="font-bold text-blue-600">Rp {booking.totalPrice.toLocaleString()}</span></div>
          
          {booking.status === 'upcoming' && trainDetails?.conductor && (
               <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-600 mt-2">
                   <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1"><User className='w-4 h-4' /> Kondektur:</span>
                   <span className="font-semibold text-blue-600">{trainDetails.conductor}</span>
               </div>
          )}
        </div>
        
        <div className='flex gap-2 mt-3'>
            {booking.status === 'upcoming' && (
              <button
                onClick={() => handleQuickAction(`Saya mau ngobrol sama kondektur tiket ${booking.id}`)}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className='w-4 h-4' /> Chat Kondektur
              </button>
            )}
            {booking.status === 'upcoming' && (
              <button
                onClick={() => handleQuickAction(`Batalkan booking ${booking.id}`)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
              >
                Batalkan
              </button>
            )}
             {booking.status === 'pending_payment' && (
              <button
                onClick={() => setPaymentStatus({ isOpen: true, bookingData: booking, processing: false, result: null })}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
              >
                <CreditCard className='w-4 h-4' /> Lanjutkan Pembayaran
              </button>
            )}
        </div>
      </div>
    );
  };
  
  // --- Komponen UI Payment Gateway Simulation ---
  const renderPaymentGateway = () => {
    if (!paymentStatus.isOpen || !paymentStatus.bookingData) return null;

    const { bookingData, processing } = paymentStatus;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm shadow-2xl transform transition-all duration-300 scale-100">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h4 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><CreditCard className='w-5 h-5 text-blue-600' /> Simulasi Pembayaran</h4>
            <button onClick={() => setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null })} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"><X className='w-5 h-5' /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pembayaran:</p>
              <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">Rp {bookingData.totalPrice.toLocaleString()}</p>
            </div>

            <div className="space-y-2 dark:text-gray-300">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                    <span className="font-medium">{bookingData.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Kereta:</span>
                    <span className="font-medium">{bookingData.trainName} ({bookingData.trainNumber})</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Penumpang:</span>
                    <span className="font-medium">{bookingData.passengerCount} orang</span>
                </div>
            </div>

            <h5 className="font-bold text-gray-700 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">Pilih Metode Pembayaran Simulasi:</h5>
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('success')}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader className="w-5 h-5 animate-spin" /> : <Shield className='w-5 h-5' />}
                {processing ? 'Memproses...' : 'Simulasi Pembayaran SUKSES'}
              </button>
               <button
                onClick={() => handlePayment('failure')}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader className="w-5 h-5 animate-spin" /> : <X className='w-5 h-5' />}
                {processing ? 'Memproses...' : 'Simulasi Pembayaran GAGAL'}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">Simulasi ini hanya untuk demonstrasi alur. Tidak ada transaksi uang sungguhan.</p>
          </div>
        </div>
      </div>
    );
  };
  
  // --- Komponen UI Seat Map Selection ---
  const renderSeatMapModal = () => {
    const { isOpen, trainData, initialBookingDetails, selectedSeats } = seatSelectionStatus;
    if (!isOpen || !trainData || !initialBookingDetails) return null;

    const { passengerCount } = initialBookingDetails;
    
    // Seat Map Simulation Data
    const rows = 12;
    const columns = ['A', 'B', 'C', 'D'];
    
    // Simulate occupied seats with gender
    const occupiedSeats = {
      '1A': 'male', '2B': 'female', '5D': 'male', '8A': 'male', '10C': 'female',
      '3C': 'male', '6B': 'female', '9D': 'male',
    };

    const toggleSeat = (seatNumber) => {
      const isSelected = selectedSeats.includes(seatNumber);
      
      if (isSelected) {
        setSeatSelectionStatus(prev => ({ 
          ...prev, 
          selectedSeats: prev.selectedSeats.filter(s => s !== seatNumber)
        }));
      } else if (selectedSeats.length < passengerCount) {
        setSeatSelectionStatus(prev => ({
          ...prev,
          selectedSeats: [...prev.selectedSeats, seatNumber]
        }));
      }
    };

    const getSeatClass = (seatNumber) => {
      if (occupiedSeats[seatNumber] === 'male') {
        // Abu-abu: Pria
        return 'bg-gray-500 text-white cursor-not-allowed';
      }
      if (occupiedSeats[seatNumber] === 'female') {
        // Merah Muda: Wanita
        return 'bg-pink-400 text-white cursor-not-allowed';
      }
      if (selectedSeats.includes(seatNumber)) {
        // Biru: Terpilih
        return 'bg-blue-600 text-white border-blue-800 border-2 shadow-lg hover:bg-blue-700';
      }
      // Putih: Tersedia
      return 'bg-white border border-gray-300 text-gray-800 hover:bg-blue-50 cursor-pointer';
    };
    
    const isSeatDisabled = (seatNumber) => {
        return !!occupiedSeats[seatNumber];
    };

    const canSelectMore = selectedSeats.length < passengerCount;
    const isSelectionComplete = selectedSeats.length === passengerCount;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl h-[90vh] flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Train className='w-5 h-5 text-blue-600' /> Pilih Kursi ({trainData.name})</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{trainData.origin} → {trainData.destination} | {formatDate(initialBookingDetails.date)}</p>
            </div>
            <button onClick={() => setSeatSelectionStatus(prev => ({ ...prev, isOpen: false }))} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"><X className='w-5 h-5' /></button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Legend / Keterangan */}
            <div className="flex flex-wrap gap-4 justify-center text-xs mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-300">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-white border border-gray-300"></div> Tersedia
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-pink-400"></div> Terisi (Wanita)
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-gray-500"></div> Terisi (Pria)
                </div>
                 <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-md bg-blue-600"></div> Terpilih
                </div>
                 <div className="flex items-center gap-1 font-bold text-blue-600">
                    <Users className='w-4 h-4' /> Butuh {passengerCount} Kursi
                </div>
            </div>

            {/* Seat Map Grid */}
            <div className="flex justify-center">
                <div className="bg-gray-200 dark:bg-gray-900 p-4 rounded-lg shadow-inner max-w-max">
                    <div className="text-center mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Depan Kereta</div>
                    <div className="flex gap-4">
                        {/* Kolom A & B (2 kursi) */}
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
                                <div key={row} className="flex gap-2 items-center">
                                    <span className="text-xs w-6 text-right text-gray-600 dark:text-gray-400">{row}</span>
                                    {columns.slice(0, 2).map(col => {
                                        const seatNumber = `${row}${col}`;
                                        return (
                                            <button
                                                key={seatNumber}
                                                onClick={() => toggleSeat(seatNumber)}
                                                disabled={isSeatDisabled(seatNumber) || (!canSelectMore && !selectedSeats.includes(seatNumber))}
                                                className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${getSeatClass(seatNumber)}`}
                                                title={isSeatDisabled(seatNumber) ? `Terisi (${occupiedSeats[seatNumber]})` : 'Tersedia'}
                                            >
                                                {selectedSeats.includes(seatNumber) ? <Check className='w-4 h-4 mx-auto' /> : col}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        
                        {/* Aisle (Lajur) */}
                        <div className="w-8 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-bold border-l border-r border-gray-400 dark:border-gray-600">
                           LAJUR
                        </div>

                        {/* Kolom C & D (2 kursi) */}
                         <div className="flex flex-col gap-2">
                            {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
                                <div key={row} className="flex gap-2 items-center">
                                    {columns.slice(2, 4).map(col => {
                                        const seatNumber = `${row}${col}`;
                                        return (
                                            <button
                                                key={seatNumber}
                                                onClick={() => toggleSeat(seatNumber)}
                                                disabled={isSeatDisabled(seatNumber) || (!canSelectMore && !selectedSeats.includes(seatNumber))}
                                                className={`w-8 h-8 rounded-md text-xs font-semibold transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${getSeatClass(seatNumber)}`}
                                                title={isSeatDisabled(seatNumber) ? `Terisi (${occupiedSeats[seatNumber]})` : 'Tersedia'}
                                            >
                                                {selectedSeats.includes(seatNumber) ? <Check className='w-4 h-4 mx-auto' /> : col}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="text-center mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Belakang Kereta</div>
                </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <p className={`text-center mb-3 font-semibold text-sm ${isSelectionComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                {isSelectionComplete 
                    ? `✅ Kursi terpilih: ${selectedSeats.join(', ')}` 
                    : `⏳ Pilih lagi ${passengerCount - selectedSeats.length} kursi.`}
            </p>
            <button
              onClick={() => finalizeBookingAfterSeatSelection(selectedSeats, initialBookingDetails)}
              disabled={!isSelectionComplete}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className='w-5 h-5' /> Konfirmasi & Lanjutkan ke Pembayaran
            </button>
          </div>
        </div>
      </div>
    );
  };
  // -----------------------------------

  const renderChatbot = () => (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${chatOpen ? 'w-full max-w-md' : 'w-auto'}`}>
      {!chatOpen ? (
        <button
          onClick={() => setChatOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center gap-3 group"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold hidden sm:inline">Chat dengan KAIA</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col h-[70vh] max-h-[600px] border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold">KAIA</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-blue-100">Online • Powered by Gemini</p>
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-2xl p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : msg.error ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100' : msg.paymentResult === 'success' ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100' : msg.paymentResult === 'failure' ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100' : 'bg-white border border-gray-200 text-gray-800 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    { msg.functionCall === 'searchTrains' && msg.data && Array.isArray(msg.data) && (
                      <div className="mt-3 space-y-2">{msg.data.map((train) => renderTrainCard(train, true))}</div>
                    )}
                    { (msg.functionCall === 'bookTicket' || msg.functionCall === 'cancelBooking' || msg.functionCall === 'startConductorChat') && msg.data && !Array.isArray(msg.data) && msg.data.id?.startsWith('BK') && (
                      <div className="mt-3">{renderBookingCard(msg.data)}</div>
                    )}
                    { msg.functionCall === 'getStationInfo' && msg.data && msg.data.code && (
                        <div className="mt-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                            {/* Station Info rendering */}
                        </div>
                    )}
                    { msg.functionCall === 'getUserBookings' && msg.data && Array.isArray(msg.data) && (
                      <div className="mt-3 space-y-2">{msg.data.map((booking) => renderBookingCard(booking))}</div>
                    )}
                    
                    {/* Tombol Lanjutkan Pemilihan Kursi yang muncul setelah Booking dipersiapkan */}
                    { msg.functionResult?.action === 'show_seat_map' && !seatSelectionStatus.isOpen && msg.data && (
                         <button
                            onClick={() => {
                                const train = mockDatabase.trains.find(t => t.id === msg.data.trainId);
                                setSeatSelectionStatus({
                                    isOpen: true,
                                    trainData: train,
                                    initialBookingDetails: msg.data,
                                    selectedSeats: [],
                                });
                            }}
                            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                          >
                            <User className='w-4 h-4' /> Pilih Kursi ({msg.data.passengerCount} Pax)
                          </button>
                    )}

                    {/* Tombol Lanjutkan Pembayaran yang muncul setelah Pemilihan Kursi/Booking Final */}
                    { msg.functionResult?.action === 'show_payment' && !paymentStatus.isOpen && msg.data && (
                         <button
                            onClick={() => setPaymentStatus({ isOpen: true, bookingData: msg.data, processing: false, result: null })}
                            className="mt-3 w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                          >
                            <CreditCard className='w-4 h-4' /> Lanjutkan ke Pembayaran
                          </button>
                    )}
                    
                    {/* Opsi Chat Kondektur (setelah Get Bookings) */}
                    { msg.action === 'choose_chat_booking' && Array.isArray(msg.activeBookings) && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2">
                            <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Pilih Booking untuk Chat Kondektur:</p>
                            {msg.activeBookings.map(b => (
                                <div key={b.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <p className="font-bold text-gray-800 dark:text-white">{b.id} - KA {b.trainName}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{b.origin} → {b.destination}</p>
                                    <div className="flex gap-2 text-xs">
                                        {['low', 'medium', 'high'].map(urgency => (
                                            <button
                                                key={urgency}
                                                onClick={() => handleStartChat(b.id, urgency)}
                                                className={`flex-1 py-1 rounded-full text-white font-semibold transition ${
                                                    urgency === 'low' ? 'bg-green-500 hover:bg-green-600' :
                                                    urgency === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                    'bg-red-500 hover:bg-red-600'
                                                }`}
                                            >
                                                Chat ({urgency.toUpperCase()})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">💡 Coba tanyakan:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => handleQuickAction('Cari tiket Jakarta ke Bandung besok')} className="text-xs bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 transition flex items-center gap-1"><Train className="w-3 h-3" />Cari Tiket</button>
              <button onClick={() => handleQuickAction('Pesan tiket kereta Argo Parahyangan ID 1 untuk 2 orang')} className="text-xs bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 transition flex items-center gap-1"><User className="w-3 h-3" />Pesan & Pilih Kursi</button>
              <button onClick={() => handleQuickAction('Tempat wisata terbaik di Yogyakarta')} className="text-xs bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 transition flex items-center gap-1"><Star className="w-3 h-3" />✨ Info Destinasi</button>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex gap-2">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()} placeholder="Ketik pesan Anda..." disabled={isTyping || paymentStatus.isOpen || seatSelectionStatus.isOpen || conductorChatStatus.isOpen} className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50" />
              <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping || paymentStatus.isOpen || seatSelectionStatus.isOpen || conductorChatStatus.isOpen} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
                {isTyping ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
      {renderPaymentGateway()}
      {renderSeatMapModal()}
      {renderConductorChatModal()}
    </div>
  );
  
  const renderHome = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-100">AI-Powered Booking System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Selamat Datang di<br/>KAI Intelligent Platform</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">Pengalaman booking tiket kereta yang lebih cerdas dengan bantuan AI. Chat dengan KAIA dalam bahasa Indonesia natural.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setChatOpen(true)} className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"><Bot className="w-5 h-5" />Mulai Chat dengan KAIA</button>
            <button onClick={() => handleQuickAction('Cari tiket Jakarta ke Bandung besok')} className="bg-blue-500/30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500/40 transition-all border border-white/20">Cari Tiket Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
      <nav className="bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"><Train className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">KAI Intelligent</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
               {/* Toggle Dark/Light Mode Button */}
               <button 
                  onClick={toggleDarkMode} 
                  className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title={isDarkMode ? "Light Mode" : "Dark Mode"}
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
                </button>
                
              <button onClick={() => handleQuickAction('Tampilkan booking saya')} className="hidden sm:flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <History className="w-5 h-5" /><span className="text-sm font-medium">Booking Saya</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"><Bell className="w-5 h-5" /></button>
              <button onClick={() => setChatOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                <Bot className="w-4 h-4" /><span className="hidden sm:inline">Chat KAIA</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderHome()}
      </main>
      {renderChatbot()}
      {/* Modals are rendered here */}
      {renderPaymentGateway()} 
      {renderSeatMapModal()}
      {renderConductorChatModal()}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; transition: background-color 0.3s; }
        .dark body { background-color: #1f2937; } /* Tailwind gray-900 */
        .dark { background-color: #1f2937; color: #f3f4f6; } /* Default dark background */
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-bounce { animation: bounce 1s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default KAIIntelligentPlatform;
