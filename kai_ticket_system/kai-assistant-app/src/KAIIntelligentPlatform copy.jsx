import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Train, Calendar, MapPin, Clock, Users, CreditCard, Shield, Star, ChevronRight, X, History, Bell, Loader, Check, Circle, Minus, Sparkles, FileText, Compass, ArrowDown, ArrowUp, Phone, MessageSquare, Megaphone } from 'lucide-react';

// Mock Database (Simulating MySQL) - MASSIVELY EXPANDED AND UPDATED
const mockDatabase = {
  users: [
    { id: 1, name: "Ahmad Santoso", email: "ahmad@example.com", phone: "081234567890", verified: true, memberSince: "2023-01-15", totalTrips: 24, points: 1200 }
  ],
  stations: [
    // DAOP 1 JAKARTA
    { id: 1, code: "GMR", name: "Gambir", city: "Jakarta Pusat", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "WiFi", "Lounge Eksekutif"] },
    { id: 2, code: "PSE", name: "Pasar Senen", city: "Jakarta Pusat", facilities: ["ATM", "Toilet", "Musholla", "Food Court"] },
    { id: 3, code: "JNG", name: "Jatinegara", city: "Jakarta Timur", facilities: ["ATM", "Toilet", "Musholla", "KRL Access"] },
    { id: 4, code: "JAKK", name: "Jakarta Kota", city: "Jakarta Barat", facilities: ["ATM", "Toilet", "Musholla", "Museum"] },
    { id: 5, code: "THB", name: "Tanah Abang", city: "Jakarta Pusat", facilities: ["Toilet", "Musholla", "KRL Access"] },
    { id: 6, code: "BKS", name: "Bekasi", city: "Bekasi", facilities: ["ATM", "Toilet", "Musholla"] },
    { id: 7, code: "MRI", name: "Manggarai", city: "Jakarta Selatan", facilities: ["Toilet", "Musholla", "KRL Hub"] },
    { id: 8, code: "MER", name: "Merak", city: "Cilegon", facilities: ["Toilet", "Pelabuhan Access"] },
    { id: 9, code: "CKP", name: "Cikampek", city: "Karawang", facilities: ["Toilet", "Musholla"] },
    { id: 10, code: "SER", name: "Serang", city: "Serang", facilities: ["Toilet"] },
    // DAOP 2 BANDUNG
    { id: 11, code: "BD", name: "Bandung", city: "Bandung", facilities: ["ATM", "Toilet", "Musholla", "Cafe", "WiFi", "Coworking Space"] },
    { id: 12, code: "KAC", name: "Kiaracondong", city: "Bandung", facilities: ["ATM", "Toilet", "Musholla"] },
    { id: 13, code: "CMI", name: "Cimahi", city: "Cimahi", facilities: ["Toilet", "Musholla"] },
    { id: 14, code: "PDL", name: "Padalarang", city: "Bandung Barat", facilities: ["Toilet", "Whoosh Access"] },
    { id: 15, code: "PWK", name: "Purwakarta", city: "Purwakarta", facilities: ["Toilet", "Musholla"] },
    { id: 16, code: "TSM", name: "Tasikmalaya", city: "Tasikmalaya", facilities: ["Toilet", "Musholla"] },
    { id: 17, code: "BJR", name: "Banjar", city: "Banjar", facilities: ["Toilet", "Musholla"] },
    // DAOP 3 CIREBON
    { id: 18, code: "CN", name: "Cirebon", city: "Cirebon", facilities: ["ATM", "Toilet", "Musholla", "Restaurant"] },
    { id: 19, code: "CNP", name: "Cirebon Prujakan", city: "Cirebon", facilities: ["Toilet", "Musholla"] },
    { id: 20, code: "BB", name: "Brebes", city: "Brebes", facilities: ["Toilet", "Musholla"] },
    { id: 21, code: "JTB", name: "Jatibarang", city: "Indramayu", facilities: ["Toilet", "Musholla"] },
    { id: 22, code: "HGL", name: "Haurgeulis", city: "Indramayu", facilities: ["Toilet"] },
    // DAOP 4 SEMARANG
    { id: 23, code: "SMT", name: "Semarang Tawang", city: "Semarang", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "WiFi"] },
    { id: 24, code: "SMC", name: "Semarang Poncol", city: "Semarang", facilities: ["Toilet", "Musholla"] },
    { id: 25, code: "TG", name: "Tegal", city: "Tegal", facilities: ["Toilet", "Musholla", "ATM"] },
    { id: 26, code: "PK", name: "Pekalongan", city: "Pekalongan", facilities: ["Toilet", "Musholla", "ATM"] },
    { id: 27, code: "CPU", name: "Cepu", city: "Blora", facilities: ["Toilet", "Musholla"] },
    { id: 28, code: "BJ", name: "Bojonegoro", city: "Bojonegoro", facilities: ["Toilet", "Musholla"] },
    // DAOP 5 PURWOKERTO
    { id: 29, code: "PWT", name: "Purwokerto", city: "Purwokerto", facilities: ["ATM", "Toilet", "Musholla", "Restaurant"] },
    { id: 30, code: "KYA", name: "Kroya", city: "Cilacap", facilities: ["Toilet", "Musholla"] },
    { id: 31, code: "KTA", name: "Kutoarjo", city: "Purworejo", facilities: ["Toilet", "Musholla"] },
    { id: 32, code: "KM", name: "Kebumen", city: "Kebumen", facilities: ["Toilet"] },
    { id: 33, code: "CP", name: "Cilacap", city: "Cilacap", facilities: ["Toilet", "Musholla"] },
    // DAOP 6 YOGYAKARTA
    { id: 34, code: "YK", name: "Yogyakarta", city: "Yogyakarta", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "Parking", "Pusat Oleh-oleh"] },
    { id: 35, code: "LPN", name: "Lempuyangan", city: "Yogyakarta", facilities: ["Toilet", "Musholla", "Food Court"] },
    { id: 36, code: "SLO", name: "Solo Balapan", city: "Surakarta", facilities: ["ATM", "Toilet", "Musholla", "Cafe", "WiFi", "Skybridge"] },
    { id: 37, code: "PWS", name: "Purwosari", city: "Surakarta", facilities: ["Toilet", "Musholla"] },
    { id: 38, code: "KT", name: "Klaten", city: "Klaten", facilities: ["Toilet"] },
    { id: 39, code: "WT", name: "Wates", city: "Kulon Progo", facilities: ["Toilet", "Bandara YIA Access"] },
    // DAOP 7 MADIUN
    { id: 40, code: "MN", name: "Madiun", city: "Madiun", facilities: ["Toilet", "Musholla", "ATM", "Restaurant"] },
    { id: 41, code: "KTS", name: "Kertosono", city: "Nganjuk", facilities: ["Toilet", "Musholla"] },
    { id: 42, code: "JG", name: "Jombang", city: "Jombang", facilities: ["Toilet", "Musholla"] },
    { id: 43, code: "KD", name: "Kediri", city: "Kediri", facilities: ["Toilet", "Musholla", "ATM"] },
    { id: 44, code: "TA", name: "Tulungagung", city: "Tulungagung", facilities: ["Toilet"] },
    // DAOP 8 SURABAYA
    { id: 45, code: "SGU", name: "Surabaya Gubeng", city: "Surabaya", facilities: ["ATM", "Toilet", "Musholla", "Restaurant", "Lounge", "Supermarket"] },
    { id: 46, code: "SBI", name: "Surabaya Pasarturi", city: "Surabaya", facilities: ["ATM", "Toilet", "Musholla", "Food Court"] },
    { id: 47, code: "SBK", name: "Surabaya Kota", city: "Surabaya", facilities: ["Toilet", "Musholla", "Bangunan Cagar Budaya"] },
    { id: 48, code: "ML", name: "Malang", city: "Malang", facilities: ["ATM", "Toilet", "Musholla", "Cafe", "Taman"] },
    { id: 49, code: "MR", name: "Mojokerto", city: "Mojokerto", facilities: ["Toilet"] },
    { id: 50, code: "SDA", name: "Sidoarjo", city: "Sidoarjo", facilities: ["Toilet", "Musholla"] },
    { id: 51, code: "BG", name: "Bangil", city: "Pasuruan", facilities: ["Toilet"] },
    { id: 52, code: "BL", name: "Blitar", city: "Blitar", facilities: ["Toilet", "Musholla"] },
    // DAOP 9 JEMBER
    { id: 53, code: "JR", name: "Jember", city: "Jember", facilities: ["ATM", "Toilet", "Musholla", "Restaurant"] },
    { id: 54, code: "BW", name: "Banyuwangi Kota", city: "Banyuwangi", facilities: ["Toilet", "Musholla", "Cafe"] },
    { id: 55, code: "PB", name: "Probolinggo", city: "Probolinggo", facilities: ["Toilet", "Musholla"] },
    { id: 56, code: "PS", name: "Pasuruan", city: "Pasuruan", facilities: ["Toilet"] },
    { id: 57, code: "KLT", name: "Kalisat", city: "Jember", facilities: ["Toilet"] },
    // DIVRE 1 MEDAN
    { id: 58, code: "MDN", name: "Medan", city: "Medan", facilities: ["ATM", "Toilet", "Restaurant", "Railink"] },
    { id: 59, code: "TTI", name: "Tebing Tinggi", city: "Tebing Tinggi", facilities: ["Toilet"] },
    { id: 60, code: "RAP", name: "Rantau Prapat", city: "Labuhanbatu", facilities: ["Toilet"] },
    // DIVRE 2 & 3 (SUMSEL & LAMPUNG)
    { id: 61, code: "KPT", name: "Kertapati", city: "Palembang", facilities: ["ATM", "Toilet", "Musholla"] },
    { id: 62, code: "LLG", name: "Lubuklinggau", city: "Lubuklinggau", facilities: ["Toilet"] },
    { id: 63, code: "TNK", name: "Tanjungkarang", city: "Bandar Lampung", facilities: ["Toilet", "Musholla"] },
  ],
  trains: [
    // Rute Jakarta - Bandung (GMR-BD)
    { id: 1, name: "Argo Parahyangan", number: "7082", class: "Eksekutif", origin: "GMR", destination: "BD", departure: "06:30", arrival: "09:15", price: 210000, available: 45, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "06:30" }, { code: "BD", time: "09:15" }] },
    { id: 2, name: "Argo Parahyangan", number: "7082", class: "Ekonomi", origin: "GMR", destination: "BD", departure: "06:30", arrival: "09:15", price: 160000, available: 80, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "GMR", time: "06:30" }, { code: "BD", time: "09:15" }] },
    { id: 3, name: "Papandayan", number: "7048", class: "Eksekutif", origin: "GMR", destination: "BD", departure: "08:50", arrival: "11:35", price: 225000, available: 22, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "08:50" }, { code: "BD", time: "11:35" }] },
    { id: 4, name: "Papandayan", number: "7048", class: "Ekonomi", origin: "GMR", destination: "BD", departure: "08:50", arrival: "11:35", price: 170000, available: 15, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "GMR", time: "08:50" }, { code: "BD", time: "11:35" }] },

    // Rute Jakarta - Surabaya (Lintas Utara, GMR-SBI)
    { id: 5, name: "Argo Bromo Anggrek", number: "4", class: "Eksekutif", origin: "GMR", destination: "SBI", departure: "08:20", arrival: "16:20", price: 650000, available: 35, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi", "Luxury Class"], route: [{ code: "GMR", time: "08:20" }, { code: "CN", time: "11:00" }, { code: "SMT", time: "13:30" }, { code: "SBI", time: "16:20" }] },
    { id: 6, name: "Sembrani", number: "128", class: "Eksekutif", origin: "GMR", destination: "SBI", departure: "19:30", arrival: "04:00", price: 620000, available: 40, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "19:30" }, { code: "CN", time: "22:10" }, { code: "SMT", time: "00:45" }, { code: "SBI", time: "04:00" }] },
    { id: 7, name: "Gumarang", number: "158", class: "Eksekutif", origin: "PSE", destination: "SBI", departure: "15:50", arrival: "02:40", price: 510000, available: 18, total: 40, status: "delayed", delay: 25, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "PSE", time: "15:50" }, { code: "CN", time: "18:45" }, { code: "SMT", time: "21:30" }, { code: "SBI", time: "02:40" }] },
    { id: 8, name: "Gumarang", number: "158", class: "Bisnis", origin: "PSE", destination: "SBI", departure: "15:50", arrival: "02:40", price: 400000, available: 50, total: 64, status: "delayed", delay: 25, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "PSE", time: "15:50" }, { code: "CN", time: "18:45" }, { code: "SMT", time: "21:30" }, { code: "SBI", time: "02:40" }] },

    // Rute Jakarta - Surabaya (Lintas Selatan, GMR-SGU)
    { id: 9, name: "Argo Lawu", number: "8", class: "Eksekutif", origin: "GMR", destination: "SGU", departure: "20:45", arrival: "07:15", price: 630000, available: 25, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "20:45" }, { code: "PWT", time: "01:30" }, { code: "YK", time: "03:10" }, { code: "SLO", time: "04:00" }, { code: "SGU", time: "07:15" }] },
    { id: 10, name: "Bima", number: "60", class: "Eksekutif", origin: "GMR", destination: "SGU", departure: "17:10", arrival: "04:11", price: 615000, available: 33, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "17:10" }, { code: "CN", time: "19:50" }, { code: "YK", time: "00:30" }, { code: "SGU", time: "04:11" }] },
    { id: 11, name: "Gajayana", number: "72", class: "Eksekutif", origin: "GMR", destination: "ML", departure: "18:40", arrival: "07:05", price: 680000, available: 28, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "GMR", time: "18:40" }, { code: "PWT", time: "23:20" }, { code: "YK", time: "01:15" }, { code: "SLO", time: "02:05" }, { code: "MN", time: "04:00" }, { code: "ML", time: "07:05" }] },

    // Rute Yogyakarta -> Jakarta (YK-GMR & LPN-PSE)
    { id: 12, name: "Taksaka", number: "81", class: "Eksekutif", origin: "YK", destination: "GMR", departure: "08:00", arrival: "14:30", price: 480000, available: 40, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "YK", time: "08:00" }, { code: "PWT", time: "10:00" }, { code: "GMR", time: "14:30" }] },
    { id: 13, name: "Taksaka", number: "83", class: "Eksekutif", origin: "YK", destination: "GMR", departure: "20:00", arrival: "02:30", price: 460000, available: 50, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "YK", time: "20:00" }, { code: "PWT", time: "22:00" }, { code: "GMR", time: "02:30" }] },
    { id: 14, name: "Bengawan", number: "245", class: "Ekonomi", origin: "PWS", destination: "PSE", departure: "20:30", arrival: "06:00", price: 74000, available: 112, total: 112, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "PWS", time: "20:30" }, { code: "LPN", time: "21:20" }, { code: "PSE", time: "06:00" }] },
    { id: 23, name: "Progo", number: "247", class: "Ekonomi", origin: "LPN", destination: "PSE", departure: "15:10", arrival: "23:30", price: 220000, available: 90, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "LPN", time: "15:10" }, { code: "PWT", time: "18:00" }, { code: "PSE", time: "23:30" }] },
    
    // Rute Bandung - Surabaya (BD-SGU)
    { id: 15, name: "Turangga", number: "66", class: "Eksekutif", origin: "BD", destination: "SGU", departure: "18:10", arrival: "04:20", price: 580000, available: 38, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "BD", time: "18:10" }, { code: "YK", time: "00:40" }, { code: "SLO", time: "01:30" }, { code: "SGU", time: "04:20" }] },
    { id: 16, name: "Argo Wilis", number: "6", class: "Eksekutif", origin: "BD", destination: "SGU", departure: "08:15", arrival: "17:55", price: 600000, available: 42, total: 50, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "WiFi", "Restorasi"], route: [{ code: "BD", time: "08:15" }, { code: "YK", time: "14:30" }, { code: "SLO", time: "15:20" }, { code: "SGU", time: "17:55" }] },
    { id: 24, name: "Pasundan", number: "240", class: "Ekonomi", origin: "KAC", destination: "SGU", departure: "10:15", arrival: "00:35", price: 245000, available: 100, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "KAC", time: "10:15" }, { code: "LPN", time: "18:00" }, { code: "SGU", time: "00:35" }] },
    { id: 25, name: "Kahuripan", number: "238", class: "Ekonomi", origin: "KAC", destination: "BL", departure: "23:10", arrival: "13:10", price: 84000, available: 112, total: 112, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "KAC", time: "23:10" }, { code: "LPN", time: "07:10" }, { code: "BL", time: "13:10" }] },
    
    // Rute Surabaya - Banyuwangi (SGU-BW)
    { id: 17, name: "Wijayakusuma", number: "116", class: "Eksekutif", origin: "SGU", destination: "BW", departure: "18:25", arrival: "00:20", price: 320000, available: 20, total: 40, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "SGU", time: "18:25" }, { code: "JR", time: "22:10" }, { code: "BW", time: "00:20" }] },
    { id: 18, name: "Wijayakusuma", number: "116", class: "Ekonomi", origin: "SGU", destination: "BW", departure: "18:25", arrival: "00:20", price: 250000, available: 60, total: 80, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "SGU", time: "18:25" }, { code: "JR", time: "22:10" }, { code: "BW", time: "00:20" }] },
    { id: 19, name: "Probowangi", number: "265", class: "Ekonomi", origin: "SGU", destination: "BW", departure: "05:30", arrival: "12:25", price: 56000, available: 10, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "SGU", time: "05:30" }, { code: "JR", time: "09:40" }, { code: "BW", time: "12:25" }] },
  
    // Rute Kereta Api Sumatra (Simulasi)
    { id: 20, name: "Sribilah Utama", number: "U52", class: "Eksekutif", origin: "MDN", destination: "RAP", departure: "08:00", arrival: "14:30", price: 180000, available: 30, total: 40, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "MDN", time: "08:00" }, { code: "TTI", time: "10:00" }, { code: "RAP", time: "14:30" }] },
    { id: 21, name: "Sribilah Utama", number: "U52", class: "Bisnis", origin: "MDN", destination: "RAP", departure: "08:00", arrival: "14:30", price: 150000, available: 50, total: 60, status: "on-time", delay: 0, facilities: ["AC", "Colokan", "Restorasi"], route: [{ code: "MDN", time: "08:00" }, { code: "TTI", time: "10:00" }, { code: "RAP", time: "14:30" }] },
    { id: 22, name: "Raja Basa", number: "S12", class: "Ekonomi", origin: "TNK", destination: "KPT", departure: "08:30", arrival: "18:00", price: 32000, available: 100, total: 106, status: "on-time", delay: 0, facilities: ["AC", "Colokan"], route: [{ code: "TNK", time: "08:30" }, { code: "KPT", time: "18:00" }] },
  ],
  bookings: [
    { id: "BK001", userId: 1, trainId: 16, date: "2025-10-25", seatNumbers: ["EKS-3A"], status: "upcoming", passengerName: "Ahmad Santoso", passengerCount: 1, paymentMethod: "Virtual Account", totalPrice: 600000, trainName: "Argo Wilis", trainNumber: "6", origin: "Bandung", destination: "Surabaya Gubeng", departure: "08:15", arrival: "17:55" },
    { id: "BK002", userId: 1, trainId: 11, date: "2025-11-10", seatNumbers: ["EKS-5B", "EKS-5C"], status: "upcoming", passengerName: "Ahmad Santoso", passengerCount: 2, paymentMethod: "Credit Card", totalPrice: 1360000, trainName: "Gajayana", trainNumber: "72", origin: "Gambir", destination: "Malang", departure: "18:40", arrival: "07:05" },
    { id: "BK003", userId: 1, trainId: 1, date: "2025-09-15", seatNumbers: ["EKS-12A"], status: "completed", passengerName: "Ahmad Santoso", passengerCount: 1, paymentMethod: "GoPay", totalPrice: 210000, trainName: "Argo Parahyangan", trainNumber: "7082", origin: "Gambir", destination: "Bandung", departure: "06:30", arrival: "09:15" }
  ],
  conversations: []
};

// Gemini Function Definitions
const geminiTools = [
  {
    name: "searchTrains",
    description: "Search for available trains between two stations on a specific date. Use this for general schedule inquiries.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin station code (e.g. GMR, BD, YK) or a general city/area name (e.g. Jakarta, Jakarta Timur, Bandung, Jogja)" },
        destination: { type: "string", description: "Destination station code or city name" },
        date: { type: "string", description: "Travel date in YYYY-MM-DD format. If user says 'besok' use tomorrow's date, 'hari ini' use today" },
        trainClass: { type: "string", enum: ["Eksekutif", "Bisnis", "Ekonomi", "all"], description: "Preferred train class. Use 'all' if not specified" }
      },
      required: ["origin", "destination", "date"]
    }
  },
   {
    name: "findBestTrain",
    description: "Finds the single best train based on a specific criteria like cheapest, fastest, most expensive, most comfortable, or earliest/latest departure. MUST use this for superlative queries ('ter-'), e.g., 'termurah', 'tercepat', 'paling nyaman', 'termahal', 'paling awal'.",
    parameters: {
         type: "object",
         properties: {
            origin: { type: "string", description: "Origin station code or a general city/area name (e.g. Jakarta, Jogja)." },
            destination: { type: "string", description: "Destination station code or city name." },
            date: { type: "string", description: "Travel date in YYYY-MM-DD format." },
            criteria: { type: "string", enum: ["termurah", "termahal", "tercepat", "paling awal", "paling akhir", "ternyaman"], description: "The superlative criteria for the search." }
        },
        required: ["origin", "destination", "date", "criteria"]
    }
  },
  {
    name: "bookTicket",
    description: "Prepare a train booking and optionally select seats. The user might specify the number of people, e.g., 'for 2 people'.",
    parameters: {
      type: "object",
      properties: {
        trainId: { type: "number", description: "Train ID from search results" },
        date: { type: "string", description: "Travel date in YYYY-MM-DD format" },
        passengerName: { type: "string", description: "Full name of the main passenger" },
        passengerCount: { type: "number", description: "Number of passengers, default 1. Extract from user query if mentioned." },
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
        trainNumber: { type: "string", description: "Train number (e.g., 7082, 4, 128)" }
      },
      required: ["trainNumber"]
    }
  },
  {
    name: "getUserBookings",
    description: "Retrieve user's booking history. Use when user asks about 'my bookings', 'riwayat', or 'tiket saya'.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID, default to 1 for current demo user" },
        status: { type: "string", enum: ["all", "upcoming", "completed", "cancelled"], description: "Filter by status, default 'all'" }
      },
      required: ["userId"]
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
        stationCode: { type: "string", description: "Station code (e.g., GMR, BD, YK, SGU)" }
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
    name: "submitFeedback",
    description: "Submit feedback or a complaint about a train journey that is currently in progress. Use this when a user wants to complain, report an issue, or give feedback about their current trip.",
    parameters: {
      type: "object",
      properties: {
        trainNumber: { type: "string", description: "The train number the user is currently on." },
        feedbackMessage: { type: "string", description: "The user's detailed feedback or complaint message." }
      },
      required: ["trainNumber", "feedbackMessage"]
    }
  }
];

// Function Implementations
const functionImplementations = {
  searchTrains: ({ origin, destination, date, trainClass = "all" }) => {
    const stationAliases = { "jogja": "yogyakarta", "yogya": "yogyakarta", "solo": "surakarta" };
    const findStations = (query, cityOnly = false) => {
        let lowerQuery = query.toLowerCase();
        if (stationAliases[lowerQuery]) { lowerQuery = stationAliases[lowerQuery]; }
        if (cityOnly) return mockDatabase.stations.filter(s => s.city.toLowerCase().includes(lowerQuery));
        const exactCode = mockDatabase.stations.find(s => s.code.toLowerCase() === lowerQuery);
        if (exactCode) return [exactCode];
        return mockDatabase.stations.filter(s => s.city.toLowerCase().includes(lowerQuery) || s.name.toLowerCase().includes(lowerQuery));
    };

    const originStations = findStations(origin);
    const destStations = findStations(destination);

    if (originStations.length === 0) return { success: false, message: `Maaf, saya tidak dapat menemukan stasiun keberangkatan untuk "${origin}".` };
    if (destStations.length === 0) return { success: false, message: `Maaf, saya tidak dapat menemukan stasiun tujuan untuk "${destination}".` };

    if (originStations.length > 1) {
        return { success: true, action: 'clarify_origin', message: `Saya menemukan beberapa stasiun di sekitar **${origin}**. Silakan pilih stasiun keberangkatan yang Anda inginkan:`, data: originStations.map(s => ({ code: s.code, name: s.name, city: s.city })), originalQuery: { origin, destination, date, trainClass, type: 'search' } };
    }
    if (destStations.length > 1) {
        return { success: true, action: 'clarify_destination', message: `Tentu, dari ${originStations[0].name}. Untuk tujuan di **${destination}**, ada beberapa pilihan stasiun. Silakan pilih:`, data: destStations.map(s => ({ code: s.code, name: s.name, city: s.city })), originalQuery: { origin: originStations[0].code, destination, date, trainClass, type: 'search' } };
    }

    const originCode = originStations[0].code, destCode = destStations[0].code;
    const originStationName = originStations[0].name, destStationName = destStations[0].name;
    const originCity = originStations[0].city, destCity = destStations[0].city;

    const mapTrainData = t => ({ ...t, originStation: mockDatabase.stations.find(s=>s.code === t.origin)?.name || t.origin, destinationStation: mockDatabase.stations.find(s=>s.code === t.destination)?.name || t.destination, date: date, duration: calculateDuration(t.departure, t.arrival), availabilityStatus: t.available > 20 ? "Banyak" : t.available > 10 ? "Terbatas" : "Hampir Penuh" });
    
    let initialResults = mockDatabase.trains.filter(t => t.origin === originCode && t.destination === destCode);

    if (initialResults.length === 0) {
        const originCityStations = findStations(originCity, true).map(s => s.code);
        const destCityStations = findStations(destCity, true).map(s => s.code);
        const alternativeResults = mockDatabase.trains.filter(t => originCityStations.includes(t.origin) && destCityStations.includes(t.destination));
        if (alternativeResults.length > 0) {
           return { success: true, data: alternativeResults.map(mapTrainData), message: `Maaf, tidak ada rute langsung dari ${originStationName} ke ${destStationName}. Namun, saya menemukan jadwal lain dari **${originCity}** ke **${destCity}**:` };
        }
        return { success: false, message: `Maaf, tidak ada kereta yang tersedia untuk rute dari area ${originCity} ke ${destCity} pada tanggal tersebut.` };
    }
    
    if (trainClass && trainClass.toLowerCase() !== "all") {
        const classResults = initialResults.filter(t => t.class.toLowerCase() === trainClass.toLowerCase());
        if (classResults.length > 0) {
            return { success: true, data: classResults.map(mapTrainData), message: `Ditemukan ${classResults.length} kereta kelas ${trainClass} untuk rute ${originStationName} → ${destStationName} pada ${formatDate(date)}:`, route: { origin: originStationName, destination: destStationName } };
        } else {
            return { success: true, data: initialResults.map(mapTrainData), message: `Maaf, tidak ada kereta kelas ${trainClass} untuk rute tersebut. Namun, berikut adalah pilihan di kelas lain yang tersedia:`, route: { origin: originStationName, destination: destStationName }, alternativeResults: true };
        }
    }
    return { success: true, data: initialResults.map(mapTrainData), message: `Ditemukan ${initialResults.length} kereta dari ${originStationName} → ${destStationName} pada ${formatDate(date)}:`, route: { origin: originStationName, destination: destStationName } };
  },

  findBestTrain: ({ origin, destination, date, criteria }) => {
    const stationAliases = { "jogja": "yogyakarta", "yogya": "yogyakarta", "solo": "surakarta" };
    const findStations = (query, cityOnly = false) => {
        let lowerQuery = query.toLowerCase();
        if (stationAliases[lowerQuery]) { lowerQuery = stationAliases[lowerQuery]; }
        if (cityOnly) return mockDatabase.stations.filter(s => s.city.toLowerCase().includes(lowerQuery));
        const exactCode = mockDatabase.stations.find(s => s.code.toLowerCase() === lowerQuery);
        if (exactCode) return [exactCode];
        return mockDatabase.stations.filter(s => s.city.toLowerCase().includes(lowerQuery) || s.name.toLowerCase().includes(lowerQuery));
    };

    const originStations = findStations(origin);
    const destStations = findStations(destination);

    if (originStations.length === 0) return { success: false, message: `Maaf, saya tidak dapat menemukan stasiun keberangkatan untuk "${origin}".` };
    if (destStations.length === 0) return { success: false, message: `Maaf, saya tidak dapat menemukan stasiun tujuan untuk "${destination}".` };

    if (originStations.length > 1) {
        return { success: true, action: 'clarify_origin', message: `Tentu! Untuk mencari tiket **${criteria}** di **${origin}**, silakan pilih stasiun keberangkatan:`, data: originStations.map(s => ({ code: s.code, name: s.name, city: s.city })), originalQuery: { origin, destination, date, criteria, type: 'findBest' } };
    }
    if (destStations.length > 1) {
        return { success: true, action: 'clarify_destination', message: `Oke, dari ${originStations[0].name}. Untuk tujuan di **${destination}**, stasiun mana yang Anda tuju?`, data: destStations.map(s => ({ code: s.code, name: s.name, city: s.city })), originalQuery: { origin: originStations[0].code, destination, date, criteria, type: 'findBest' } };
    }

    const originCode = originStations[0].code, destCode = destStations[0].code;
    const originCity = originStations[0].city, destCity = destStations[0].city;
    
    let results = mockDatabase.trains.filter(t => t.origin === originCode && t.destination === destCode);
    
    if (results.length === 0) {
        const originCityStations = findStations(originCity, true).map(s => s.code);
        const destCityStations = findStations(destCity, true).map(s => s.code);
        const alternativeResults = mockDatabase.trains.filter(t => originCityStations.includes(t.origin) && destCityStations.includes(t.destination));

        if (alternativeResults.length > 0) {
             const bestAlternative = functionImplementations.findBestTrain({ origin: originCity, destination: destCity, date, criteria });
             if(bestAlternative.success) {
                bestAlternative.message = `Maaf, rute langsung dari ${originStations[0].name} ke ${destStations[0].name} tidak ada. Namun, saya menemukan opsi **${criteria}** dari **${originCity}** ke **${destCity}** untuk Anda:`;
                return bestAlternative;
             }
        }
        return { success: false, message: `Maaf, tidak ada kereta yang tersedia untuk rute dari area ${originCity} ke ${destCity} pada tanggal tersebut.` };
    }

    const timeToMinutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
    const getClassScore = (c) => ({ 'Eksekutif': 3, 'Bisnis': 2, 'Ekonomi': 1 }[c] || 0);

    let sortedResults;
    switch (criteria) {
        case 'termurah':
            sortedResults = results.sort((a, b) => a.price - b.price);
            break;
        case 'termahal':
            sortedResults = results.sort((a, b) => b.price - a.price);
            break;
        case 'tercepat':
            sortedResults = results.sort((a, b) => timeToMinutes(calculateDuration(a.departure, a.arrival)) - timeToMinutes(calculateDuration(b.departure, b.arrival)));
            break;
        case 'paling awal':
            sortedResults = results.sort((a, b) => timeToMinutes(a.departure) - timeToMinutes(b.departure));
            break;
        case 'paling akhir':
            sortedResults = results.sort((a, b) => timeToMinutes(b.departure) - timeToMinutes(a.departure));
            break;
        case 'ternyaman':
            sortedResults = results.sort((a, b) => {
                const scoreA = getClassScore(a.class) + (a.facilities?.length || 0) * 0.1;
                const scoreB = getClassScore(b.class) + (b.facilities?.length || 0) * 0.1;
                return scoreB - scoreA;
            });
            break;
        default:
            sortedResults = results;
    }

    const bestTrain = sortedResults[0];
    const mappedTrain = { ...bestTrain, originStation: originStations[0].name, destinationStation: destStations[0].name, date: date, duration: calculateDuration(bestTrain.departure, bestTrain.arrival), availabilityStatus: bestTrain.available > 20 ? "Banyak" : bestTrain.available > 10 ? "Terbatas" : "Hampir Penuh" };

    return { success: true, data: mappedTrain, message: `✅ Kereta **${criteria}** ditemukan! Berikut adalah opsi terbaik untuk Anda dari ${originStations[0].name} ke ${destStations[0].name} pada ${formatDate(date)}:` };
  },

  bookTicket: ({ trainId, date, passengerName, passengerCount = 1, seatNumbers }) => {
    const train = mockDatabase.trains.find(t => t.id === trainId);
    if (!train) {
      return { success: false, message: "Kereta tidak ditemukan. Silakan cari kereta terlebih dahulu." };
    }
    
    if (!seatNumbers || seatNumbers.length === 0) {
        return {
            success: true, data: { trainId, date, passengerName, passengerCount },
            message: `Memproses pemesanan ${train.name}. Silakan pilih ${passengerCount} kursi Anda pada peta kursi di bawah.`,
            action: 'show_seat_map',
        };
    }
    
    if (train.available < passengerCount) {
      return { success: false, message: `Maaf, hanya tersisa ${train.available} kursi. Tidak cukup untuk ${passengerCount} penumpang.` };
    }

    const bookingId = `BK${String(mockDatabase.bookings.length + 1).padStart(3, '0')}`;
    
    const newBooking = {
      id: bookingId, userId: 1, trainId: trainId, date: date, seatNumbers: seatNumbers, 
      status: "pending_payment", passengerName: passengerName, passengerCount: passengerCount,
      paymentMethod: "pending", totalPrice: train.price * passengerCount, trainName: train.name,
      trainNumber: train.number, origin: mockDatabase.stations.find(s => s.code === train.origin)?.name,
      destination: mockDatabase.stations.find(s => s.code === train.destination)?.name,
      departure: train.departure, arrival: train.arrival, bookedAt: new Date().toISOString()
    };

    mockDatabase.bookings.push(newBooking);
    train.available -= passengerCount;

    return {
      success: true, data: newBooking,
      message: `✅ Booking berhasil dibuat dengan ID: ${bookingId}. Kursi: ${seatNumbers.join(', ')}. Total: Rp ${(train.price * passengerCount).toLocaleString()}. Silakan lanjutkan ke pembayaran.`,
      action: 'show_payment',
    };
  },

  getTrainStatus: ({ trainNumber }) => {
    const train = mockDatabase.trains.find(t => String(t.number).toLowerCase() === String(trainNumber).toLowerCase());
    if (!train) return { success: false, message: "Kereta tidak ditemukan. Periksa kembali nomor kereta Anda." };

    const originStation = mockDatabase.stations.find(s => s.code === train.origin);
    const destStation = mockDatabase.stations.find(s => s.code === train.destination);

    const timeToMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
    const minutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60) % 24;
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const departureTime = timeToMinutes(train.departure);
    let arrivalTime = timeToMinutes(train.arrival);
    if (arrivalTime < departureTime) arrivalTime += 24 * 60;
    
    let totalDuration = arrivalTime - departureTime;

    const simulatedElapsedTime = Math.floor(totalDuration * 0.4);
    const progress = Math.round((simulatedElapsedTime / totalDuration) * 100);
    const delay = train.status === 'delayed' ? train.delay : 0;
    const etaMinutes = timeToMinutes(train.arrival) + delay;
    const eta = minutesToTime(etaMinutes);
    const lastReported = new Date();
    lastReported.setMinutes(lastReported.getMinutes() - 2);

    let timeline = [];
    let currentSegmentProgress = 0;
    let lastPassedStationIndex = -1;

    if (train.route && train.route.length > 0) {
        for (let i = 0; i < train.route.length; i++) {
            const stationOnRoute = mockDatabase.stations.find(s => s.code === train.route[i].code);
            if (!stationOnRoute) continue;
            let stationTime = timeToMinutes(train.route[i].time);
            if(stationTime < departureTime) stationTime += 24*60;

            const elapsedSinceDeparture = stationTime - departureTime;

            let status = 'upcoming';
            if (elapsedSinceDeparture <= simulatedElapsedTime) {
                status = 'passed';
                lastPassedStationIndex = i;
            }

            timeline.push({
                code: stationOnRoute.code,
                name: stationOnRoute.name,
                time: train.route[i].time,
                status: status
            });
        }
        
        if (lastPassedStationIndex >= 0 && lastPassedStationIndex < train.route.length - 1) {
            let lastStationTime = timeToMinutes(train.route[lastPassedStationIndex].time);
            if(lastStationTime < departureTime) lastStationTime += 24*60;
            
            let nextStationTime = timeToMinutes(train.route[lastPassedStationIndex + 1].time);
            if(nextStationTime < departureTime) nextStationTime += 24*60;

            const segmentDuration = nextStationTime - lastStationTime;
            const timeIntoSegment = simulatedElapsedTime - (lastStationTime - departureTime);
            if(segmentDuration > 0) {
                currentSegmentProgress = Math.min(100, Math.max(0, Math.round((timeIntoSegment / segmentDuration) * 100)));
            }
        }
    }
    
    let currentLocation = `Menuju ${destStation.name}`;
    if (lastPassedStationIndex !== -1 && lastPassedStationIndex < timeline.length - 1) {
        currentLocation = `Antara ${timeline[lastPassedStationIndex].name} & ${timeline[lastPassedStationIndex + 1].name}`;
    }

    return {
        success: true,
        data: {
            ...train,
            originStation: originStation?.name,
            destinationStation: destStation?.name,
            statusText: train.status === "on-time" ? "✅ Tepat Waktu" : `⚠️ Terlambat ${delay} menit`,
            currentLocation: currentLocation,
            eta: eta,
            progress: progress,
            lastReported: lastReported.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            timeline: timeline,
            lastPassedStationIndex: lastPassedStationIndex,
            currentSegmentProgress: currentSegmentProgress
        },
        message: `Berikut status real-time untuk kereta ${train.name} (${train.number}):`
    };
  },

  getUserBookings: ({ userId, status = "all" }) => {
    let bookings = mockDatabase.bookings.filter(b => b.userId === userId);
    if (status !== "all") bookings = bookings.filter(b => b.status === status);

    return {
      success: true, data: bookings.map(b => ({ ...b, trainInfo: mockDatabase.trains.find(t => t.id === b.trainId) })),
      message: bookings.length > 0 ? `Ditemukan ${bookings.length} booking Anda${status !== "all" ? ` dengan status ${status}` : ''}` : `Anda belum memiliki booking${status !== "all" ? ` dengan status ${status}` : ''}.`
    };
  },

  cancelBooking: ({ bookingId, reason = "Permintaan pengguna" }) => {
    const booking = mockDatabase.bookings.find(b => b.id.toLowerCase() === bookingId.toLowerCase());
    if (!booking) return { success: false, message: "Booking tidak ditemukan. Periksa kembali ID booking Anda." };
    if (booking.status === "cancelled") return { success: false, message: "Booking ini sudah dibatalkan sebelumnya." };
    if (booking.status === "completed") return { success: false, message: "Booking yang sudah selesai tidak dapat dibatalkan." };
    if (booking.status === "pending_payment") return { success: false, message: "Booking masih dalam proses pembayaran. Harap tunggu atau batalkan melalui proses pembayaran." };

    booking.status = "cancelled"; booking.cancelledAt = new Date().toISOString(); booking.cancellationReason = reason;
    const train = mockDatabase.trains.find(t => t.id === booking.trainId);
    if (train) train.available += (booking.passengerCount || 1);

    return { success: true, data: booking, message: `✅ Booking ${bookingId} berhasil dibatalkan.\n\n💰 Refund sebesar Rp ${booking.totalPrice.toLocaleString()} akan diproses dalam 3-5 hari kerja ke metode pembayaran Anda.` };
  },

  getStationInfo: ({ stationCode }) => {
    const station = mockDatabase.stations.find(s => s.code.toLowerCase() === stationCode.toLowerCase());
    if (!station) return { success: false, message: "Stasiun tidak ditemukan. Gunakan kode stasiun seperti GMR, BD, YK, SGU." };
    return { success: true, data: station, message: `📍 Stasiun ${station.name} (${station.code})\n\nKota: ${station.city}\n\nFasilitas:\n${station.facilities.map(f => `• ${f}`).join('\n')}` };
  },

  compareTrains: ({ trainIds }) => {
    const trains = trainIds.map(id => mockDatabase.trains.find(t => t.id === id)).filter(Boolean);
    if (trains.length === 0) return { success: false, message: "Kereta tidak ditemukan untuk perbandingan." };

    return { success: true, data: trains.map(t => ({ ...t,
        originStation: mockDatabase.stations.find(s => s.code === t.origin)?.name,
        destinationStation: mockDatabase.stations.find(s => s.code === t.destination)?.name,
      })),
      message: `Perbandingan ${trains.length} kereta:`
    };
  },

  submitFeedback: ({ trainNumber, feedbackMessage }) => {
    const train = mockDatabase.trains.find(t => String(t.number).toLowerCase() === String(trainNumber).toLowerCase());
    if (!train) return { success: false, message: "Nomor kereta tidak valid untuk memberikan masukan." };

    console.log(`FEEDBACK RECORDED:\nTrain: ${trainNumber}\nMessage: ${feedbackMessage}`);
    
    return {
        success: true,
        message: `Terima kasih, masukan Anda untuk kereta ${train.name} telah kami catat. Kami akan segera menindaklanjutinya.\n\nUntuk bantuan lebih lanjut, silakan pilih opsi di bawah ini:`,
        action: 'show_feedback_options',
        data: { trainNumber }
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

const fetchWithRetry = async (url, options, retries = 3, initialDelay = 1000) => {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 503) { 
        throw new Error('Service Unavailable'); 
      }
      return response; 
    } catch (error) {
      if (i === retries - 1) {
        console.error("API call failed after multiple retries.");
        throw error; 
      }
      console.log(`API call failed, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; 
    }
  }
};


// Real Gemini API Call
const callGeminiAPI = async (conversationHistory) => {
  const GEMINI_API_KEY = 'AIzaSyDiQtk6kvsE_NOTW4SReQu5r3D8F2EsF_Q';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemInstruction = `Anda adalah KAIA (KAI Intelligent Assistant), asisten virtual PT KAI yang sangat membantu, ramah, dan profesional.

KEPRIBADIAN & GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang natural, sopan, dan mudah dipahami.
- Bersikap proaktif dan antusias dalam membantu.
- Jika pengguna memberikan lokasi umum (misal: 'Jakarta Timur' atau 'Jogja'), panggil fungsi yang relevan (searchTrains atau findBestTrain) dengan nama lokasi itu. Sistem backend akan menangani klarifikasi. JANGAN hanya bertanya kembali tanpa memanggil fungsi.
- Gunakan emoji secara bijak untuk membuat percakapan lebih ramah (✅ ⚠️ 🚄 📍 💰 ⏰).

KEMAMPUAN UTAMA:
1.  **Mencari Jadwal Umum:** Gunakan \`searchTrains\` untuk pertanyaan jadwal umum.
2.  **Mencari Tiket Terbaik:** Untuk permintaan superlatif ('ter-'), seperti "termurah", "tercepat", "paling nyaman", "termahal", "paling awal/akhir", Anda **HARUS** menggunakan fungsi \`findBestTrain\`.
3.  **Booking & Kelola Tiket:** Gunakan \`bookTicket\`, \`getUserBookings\`, \`cancelBooking\`.
4.  **Info Real-Time:** Gunakan \`getTrainStatus\` dan \`getStationInfo\`.
5.  **Keluhan & Masukan:** Gunakan \`submitFeedback\`.
6.  **Pertanyaan Umum:** Untuk pertanyaan di luar lingkup kereta api (wisata, kuliner, dll), gunakan Google Search.

PANDUAN PENTING:
- Jika user bilang "besok", gunakan tanggal ${getTomorrowDate()}.
- Jika user bilang "hari ini", gunakan ${getTodayDate()}.
- **ATURAN KEAMANAN:** Tolak dengan sopan untuk menjawab pertanyaan sensitif, tidak pantas, politis, atau SARA.

ATURAN FUNCTION CALLING:
- SELALU gunakan function untuk mendapatkan data. JANGAN berasumsi.
- Pilih fungsi yang PALING TEPAT. Prioritaskan \`findBestTrain\` untuk permintaan superlatif.`;

  const geminiHistory = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  let toolsToUse = [{ functionDeclarations: geminiTools }];
  
  const isFunctionResponseNeeded = conversationHistory.some(msg => msg.functionCall);
  
  const requestBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: geminiHistory, tools: toolsToUse,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95 }
  };

  try {
    const response = await fetchWithRetry(GEMINI_API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error (FC):', errorData);
      throw new Error(`Gemini API error (FC): ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const candidate = data.candidates?.[0];
    const functionCallPart = candidate?.content?.parts?.find(p => p.functionCall);
    if (functionCallPart) {
        const funcName = functionCallPart.functionCall.name;
        if (functionImplementations[funcName]) {
            return { functionCall: { name: funcName, arguments: functionCallPart.functionCall.args }};
        }
    }
    
    const textPart = candidate?.content?.parts?.find(p => p.text);
    if (textPart?.text) return { text: textPart.text };

    // Fallback if no function call or text is returned, but maybe a search is needed
    console.log("No direct function call or text, attempting Google Search fallback.");
    const googleSearchRequestBody = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: geminiHistory, tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95 }
    };
     const gsResponse = await fetchWithRetry(GEMINI_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(googleSearchRequestBody)
    });
    if (!gsResponse.ok) {
        const errorData = await gsResponse.json();
        throw new Error(`Gemini API error (GS): ${gsResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    const gsData = await gsResponse.json();
    const gsCandidate = gsData.candidates?.[0];
    const gsTextPart = gsCandidate?.content?.parts?.find(p => p.text);
    return { text: gsTextPart?.text || 'Maaf, saya tidak dapat menemukan jawaban yang relevan.' };

    
  } catch (error) { 
    console.error('Error during API call attempt:', error); 
    return { text: 'Maaf, saya sedang mengalami gangguan koneksi. 🙏', error: true };
  }
};

const callGeminiForTextGeneration = async (prompt) => {
  const GEMINI_API_KEY = 'AIzaSyDiQtk6kvsE_NOTW4SReQu5r3D8F2EsF_Q';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const requestBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }};

  try {
    const response = await fetchWithRetry(GEMINI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    if (!response.ok) throw new Error('Gemini API request failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak bisa menghasilkan respons saat ini.';
  } catch (error) {
    console.error("Error calling Gemini for text generation:", error);
    return 'Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi nanti.';
  }
};


const KAIIntelligentPlatform = () => {
  const [messages, setMessages] = useState([
    { id: 'initial-message', role: 'assistant', content: 'Halo! Saya KAIA, asisten virtual KAI. 🚄\n\nSaya siap membantu Anda:\n• Cari & pesan tiket kereta\n• Cek status kereta real-time\n• Kelola booking Anda\n• Info stasiun & fasilitas\n\nAda yang bisa saya bantu hari ini?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  const [paymentStatus, setPaymentStatus] = useState({ isOpen: false, bookingData: null, processing: false, result: null });
  const [seatSelectionStatus, setSeatSelectionStatus] = useState({ isOpen: false, trainData: null, initialBookingDetails: null, selectedSeats: [] });
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, booking: null, loading: false, content: '' });
  const [itineraryModal, setItineraryModal] = useState({ isOpen: false, booking: null, loading: false, content: '', duration: 3 });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handlePayment = (result) => {
    setPaymentStatus(prev => ({ ...prev, processing: true }));
    setTimeout(() => {
      const { bookingData } = paymentStatus;
      const bookingIndex = mockDatabase.bookings.findIndex(b => b.id === bookingData.id);
      let newResult;
      if (bookingIndex !== -1) {
        if (result === 'success') {
          mockDatabase.bookings[bookingIndex].status = 'upcoming'; mockDatabase.bookings[bookingIndex].paymentMethod = 'Simulasi Transfer Bank';
          newResult = { status: 'success', message: `Pembayaran untuk booking ${bookingData.id} berhasil! ✅` };
        } else {
          mockDatabase.bookings[bookingIndex].status = 'failed';
          const train = mockDatabase.trains.find(t => t.id === bookingData.trainId);
          if (train) train.available += (bookingData.passengerCount || 1);
          newResult = { status: 'failure', message: `Pembayaran untuk booking ${bookingData.id} gagal. ⚠️` };
        }
      } else { newResult = { status: 'failure', message: 'Booking tidak ditemukan.' }; }
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: newResult.message, paymentResult: newResult.status }]);
      setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null });
    }, 1500);
  };
  
  const finalizeBookingAfterSeatSelection = async (selectedSeats, initialDetails) => {
    setSeatSelectionStatus({ isOpen: false, trainData: null, initialBookingDetails: null, selectedSeats: [] });
    const { trainId, date, passengerName, passengerCount } = initialDetails;
    const finalBookingQuery = `Tolong finalisasi booking untuk kereta ID ${trainId} pada ${date} atas nama ${passengerName} (${passengerCount} pax) dengan kursi: ${selectedSeats.join(', ')}`;
    await handleSendMessage(finalBookingQuery);
  };

  const handleClarificationResponse = async (stationCode, originalQuery, type) => {
    let newQuery;
    const queryType = originalQuery.type || 'search';
    
    if (type === 'origin') {
        newQuery = queryType === 'findBest'
            ? `Cari tiket ${originalQuery.criteria} dari stasiun ${stationCode} ke ${originalQuery.destination} pada ${originalQuery.date}`
            : `Cari kereta dari stasiun ${stationCode} ke ${originalQuery.destination} pada ${originalQuery.date} kelas ${originalQuery.trainClass || 'semua'}`;
    } else { // destination
        newQuery = queryType === 'findBest'
            ? `Cari tiket ${originalQuery.criteria} dari ${originalQuery.origin} ke stasiun ${stationCode} pada ${originalQuery.date}`
            : `Cari kereta dari ${originalQuery.origin} ke stasiun ${stationCode} pada ${originalQuery.date} kelas ${originalQuery.trainClass || 'semua'}`;
    }
    
    setMessages(prev => prev.slice(0, -1));
    await handleSendMessage(newQuery);
  };

   const handleAlternativeRouteResponse = async (data) => {
        const { origin, destination, date, criteria, type } = data;
        let newQuery = type === 'findBest'
            ? `Cari tiket ${criteria} dari ${origin} ke ${destination} pada ${date}`
            : `Cari kereta dari ${origin} ke ${destination} pada ${date}`;
        setMessages(prev => prev.slice(0, -1));
        await handleSendMessage(newQuery);
   }

  const handleSendMessage = async (messageContent) => {
    const content = (typeof messageContent === 'string' ? messageContent : inputMessage).trim();
    if (!content) return;

    if (paymentStatus.isOpen) setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null });
    if (seatSelectionStatus.isOpen) setSeatSelectionStatus(prev => ({ ...prev, isOpen: false }));

    const userMessage = { id: Date.now(), role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await callGeminiAPI(updatedMessages);
      let assistantMessage;

      if (response.error) {
        assistantMessage = { id: Date.now() + 1, role: 'assistant', content: response.text, error: true };
      } else if (response.functionCall) {
        const { name: funcName, arguments: funcArgs } = response.functionCall;
        console.log('Executing function:', funcName, funcArgs);
        
        if (functionImplementations[funcName]) {
            const result = functionImplementations[funcName](funcArgs);
            assistantMessage = { id: Date.now() + 1, role: 'assistant', content: result.message, functionCall: funcName, functionResult: result };
            if (result.success && result.data) assistantMessage.data = result.data;
            if (funcName === 'searchTrains' && Array.isArray(result.data) && result.data.length > 0) {
              assistantMessage.sortConfig = { key: 'departure', direction: 'ascending' };
            }
            
            if (result.action === 'show_seat_map' && result.success) {
                const train = mockDatabase.trains.find(t => t.id === result.data.trainId);
                setSeatSelectionStatus({ isOpen: true, trainData: train, initialBookingDetails: result.data, selectedSeats: [] });
            } else if (result.action === 'show_payment' && result.success) {
                setPaymentStatus({ isOpen: true, bookingData: result.data, processing: false, result: null });
            }
        } else {
            console.error(`Function ${funcName} is not implemented.`);
            assistantMessage = { id: Date.now() + 1, role: 'assistant', content: `Kesalahan: Fungsi ${funcName} tidak ditemukan.`, error: true };
        }
      } else {
        assistantMessage = { id: Date.now() + 1, role: 'assistant', content: response.text || "Maaf, saya tidak mengerti. Bisa coba lagi?" };
      }
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '🚨 Maaf, terjadi kesalahan sistem.', error: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionText) => {
    if (!chatOpen) setChatOpen(true);
    handleSendMessage(actionText);
  };

  const handleGenerateSummary = async (booking) => {
    setSummaryModal({ isOpen: true, booking, loading: true, content: '' });
    const prompt = `Anda adalah asisten perjalanan yang ramah. Buatkan ringkasan perjalanan (smart trip summary) yang singkat dan menarik dalam format paragraf berdasarkan detail booking berikut. Gunakan sapaan yang hangat.
    - Nama Kereta: ${booking.trainName} (${booking.trainNumber}) - Rute: ${booking.origin} ke ${booking.destination} - Tanggal: ${formatDate(booking.date)} - Keberangkatan: Pukul ${booking.departure} - Kedatangan: Pukul ${booking.arrival} - Penumpang: ${booking.passengerName}. Sertakan pengingat singkat seperti "jangan lupa siapkan KTP".`;
    const result = await callGeminiForTextGeneration(prompt);
    setSummaryModal({ isOpen: true, booking, loading: false, content: result });
  };

  const handleGenerateItinerary = async () => {
    if (!itineraryModal.booking) return;
    setItineraryModal(prev => ({ ...prev, loading: true }));
    const { booking, duration } = itineraryModal;
    
    const prompt = `Anda adalah perencana perjalanan ahli yang personal dan ramah. Buatkan rencana perjalanan (itinerary) yang detail dan disesuaikan dengan jadwal kereta saya untuk liburan di **${booking.destination}**.

Berikut adalah detail tiket kereta saya:
- **Tujuan:** ${booking.destination}
- **Tanggal Tiba:** ${formatDate(booking.date)}
- **Waktu Tiba di Stasiun:** Pukul ${booking.arrival}
- **Lama Liburan yang diinginkan:** ${duration} hari

Tolong buatkan rencana perjalanan untuk **${duration} hari**, yang dimulai sejak saya tiba.

**Instruksi Penting untuk Anda, KAIA:**
1.  **Sinkronisasi Waktu Tiba:** Rencana untuk **Hari Pertama** harus dimulai **SETELAH** saya tiba di stasiun pukul **${booking.arrival}**. Aktivitas pertama haruslah yang realistis, seperti perjalanan ke hotel, makan malam di dekat stasiun, atau aktivitas malam yang santai.
2.  **Hari Terakhir:** Rencana di hari terakhir harus logis. Berikan aktivitas pagi/siang dan pastikan ada cukup waktu untuk membeli oleh-oleh dan kembali ke stasiun untuk perjalanan pulang. Asumsikan perjalanan pulang di sore/malam hari.
3.  **Personalisasi:** Buatlah itinerary ini terasa personal. Gunakan sapaan seperti "Setibanya Anda di stasiun..." atau "Setelah beristirahat...".
4.  **Format Jelas:** Gunakan format Hari 1, Hari 2, dst., dengan sub-bagian Pagi, Siang, dan Malam.
5.  **Rekomendasi Terbaik:** Berikan rekomendasi tempat wisata ikonik, kuliner lokal yang wajib dicoba, dan tips perjalanan yang bermanfaat untuk kota ${booking.destination}.`;

    const result = await callGeminiForTextGeneration(prompt);
    setItineraryModal(prev => ({ ...prev, loading: false, content: result }));
  };
  
  const handleSort = (messageId, sortKey) => {
    setMessages(prevMessages => prevMessages.map(msg => {
        if (msg.id === messageId) {
            const newDirection = msg.sortConfig.key === sortKey && msg.sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
            const newSortConfig = { key: sortKey, direction: newDirection };

            const sortedData = [...msg.data].sort((a, b) => {
                let aValue = a[newSortConfig.key]; let bValue = b[newSortConfig.key];
                if (newSortConfig.key === 'departure' || newSortConfig.key === 'arrival') {
                    aValue = parseInt(aValue.replace(':', ''), 10); bValue = parseInt(bValue.replace(':', ''), 10);
                }
                if (aValue < bValue) return newDirection === 'ascending' ? -1 : 1;
                if (aValue > bValue) return newDirection === 'ascending' ? 1 : -1;
                return 0;
            });
            return { ...msg, data: sortedData, sortConfig: newSortConfig };
        }
        return msg;
    }));
  };

  const RealTimeJourneyTimeline = ({ journeyData }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { name, number, class: trainClass, statusText, eta, lastReported, timeline, lastPassedStationIndex, currentSegmentProgress } = journeyData;
    
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3 space-y-4 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-blue-600 text-lg">{name}</p>
                    <p className="text-xs text-gray-500">{number} • {trainClass}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ statusText.includes('Tepat Waktu') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }`}>
                    {statusText}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center border-y border-gray-100 py-4">
                <div>
                    <p className="text-xs text-gray-500">Waktu Saat Ini</p>
                    <p className="font-bold text-gray-800 text-lg tracking-wider">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Estimasi Tiba (ETA)</p>
                    <p className="font-bold text-blue-600 text-lg tracking-wider">{eta}</p>
                </div>
            </div>

            <div className="relative pl-5">
                {timeline.map((station, index) => (
                    <div key={`${station.code}-${index}`} className="relative pb-12">
                        {index < timeline.length - 1 && <div className="absolute top-2 left-[5.5px] w-0.5 h-full bg-gray-200"></div>}
                        
                        <div className={`absolute top-0 left-0 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ${station.status === 'passed' ? 'bg-green-500' : 'bg-gray-300'}`}>
                           {station.status === 'passed' && <Check className="w-3 h-3 text-white"/>}
                        </div>

                        <div className="pl-6">
                            <p className={`font-semibold ${station.status === 'passed' ? 'text-gray-800' : 'text-gray-400'}`}>{station.name}</p>
                            <p className={`text-xs ${station.status === 'passed' ? 'text-gray-600' : 'text-gray-400'}`}>Jadwal: {station.time}</p>
                        </div>

                        {lastPassedStationIndex === index && index < timeline.length - 1 && (
                            <div className="absolute left-[0px] transform transition-all duration-1000" style={{ top: `calc(1.75rem + ${currentSegmentProgress * 0.2}rem)` }}>
                                <div className="relative">
                                    <Train className="w-5 h-5 text-white bg-blue-600 rounded-full p-0.5" />
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-md font-semibold whitespace-nowrap shadow-lg">
                                        Posisi Anda
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 transform rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
                <button 
                    onClick={() => handleQuickAction(`Saya ingin memberi masukan untuk kereta ${number}`)}
                    className="w-full bg-orange-100 text-orange-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-200 transition flex items-center justify-center gap-2"
                >
                    <Megaphone className="w-4 h-4" /> Beri Masukan / Keluhan
                </button>
            </div>
        </div>
    );
  };

  const renderTrainCard = (train, showBookButton = false) => {
    if (!train || typeof train.price === 'undefined') return null; // Guard against incomplete data
    return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-blue-600 text-lg">{train.name}</p>
          <p className="text-xs text-gray-500">{train.number} • {train.class}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ train.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }`}>
           {train.status === 'delayed' && train.delay ? `⚠️ +${train.delay}m` : '✅ Tepat Waktu'}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm mb-4 bg-gray-50 p-3 rounded-lg">
        <div className="text-center"> <p className="font-bold text-gray-800">{train.departure}</p> <p className="text-xs text-gray-500">{train.originStation}</p> </div>
        <div className="flex-1 mx-3">
            <div className="border-t-2 border-dashed border-gray-300 relative my-2"> <Train className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-1" /> </div>
            <p className="text-xs text-center text-gray-500">{train.duration}</p>
        </div>
        <div className="text-center"> <p className="font-bold text-gray-800">{train.arrival}</p> <p className="text-xs text-gray-500">{train.destinationStation}</p> </div>
      </div>
      <div className="flex items-center justify-between">
        <div> <p className="font-bold text-blue-600 text-xl">Rp {(train.price || 0).toLocaleString()}</p> <p className="text-xs text-gray-500">{train.availabilityStatus} • {train.available} kursi</p> </div>
        {showBookButton && ( <button onClick={() => handleQuickAction(`Pesan tiket kereta ${train.name} ID ${train.id} untuk saya`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"> Pesan </button> )}
      </div>
      {train.facilities && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2"> {train.facilities.map((facility, idx) => ( <span key={`${train.id}-${facility}-${idx}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"> {facility} </span> ))} </div>
        </div>
      )}
    </div>
  )};

  const renderBookingCard = (booking) => {
    const statusColors = { upcoming: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700', pending_payment: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700' };
    const statusText = { upcoming: '📅 Tiket Aktif', completed: '✅ Selesai', cancelled: '❌ Dibatalkan', pending_payment: '⏳ Menunggu Pembayaran', failed: '🛑 Pembayaran Gagal' };
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <div> <p className="font-bold text-gray-800">{booking.trainName}</p> <p className="text-xs text-gray-500">{booking.id} • {booking.trainNumber}</p> </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[booking.status]}`}> {statusText[booking.status]} </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Penumpang:</span><span className="font-semibold">{booking.passengerName}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Tanggal:</span><span className="font-semibold">{formatDate(booking.date)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Rute:</span><span className="font-semibold">{booking.origin} → {booking.destination}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Kursi:</span><span className="font-semibold">{booking.seatNumbers.join(', ')}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-bold text-blue-600">Rp {booking.totalPrice.toLocaleString()}</span></div>
        </div>
        {booking.status === 'upcoming' && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <button onClick={() => handleGenerateSummary(booking)} className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition flex items-center justify-center gap-2"> <Sparkles className="w-4 h-4" /> Ringkasan Cerdas </button>
            <button onClick={() => setItineraryModal({ isOpen: true, booking, loading: false, content: '', duration: 3 })} className="w-full bg-green-100 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition flex items-center justify-center gap-2"> <Compass className="w-4 h-4" /> Buat Rencana Perjalanan </button>
            <button onClick={() => handleQuickAction(`Batalkan booking ${booking.id}`)} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"> Batalkan Booking </button>
          </div>
        )}
         {booking.status === 'pending_payment' && ( <button onClick={() => setPaymentStatus({ isOpen: true, bookingData: booking, processing: false, result: null })} className="mt-3 w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"> <CreditCard className='w-4 h-4' /> Lanjutkan Pembayaran </button> )}
      </div>
    );
  };
  
  const renderPaymentGateway = () => {
    if (!paymentStatus.isOpen || !paymentStatus.bookingData) return null;
    const { bookingData, processing } = paymentStatus;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl transform transition-all">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2"><CreditCard className='w-5 h-5 text-blue-600' /> Simulasi Pembayaran</h4>
            <button onClick={() => setPaymentStatus({ isOpen: false, bookingData: null, processing: false, result: null })} className="p-1 text-gray-500 hover:text-gray-700 transition"><X className='w-5 h-5' /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg"> <p className="text-sm text-gray-600">Total Pembayaran:</p> <p className="text-3xl font-extrabold text-blue-700">Rp {bookingData.totalPrice.toLocaleString()}</p> </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Booking ID:</span><span className="font-medium">{bookingData.id}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Kereta:</span><span className="font-medium">{bookingData.trainName} ({bookingData.trainNumber})</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Penumpang:</span><span className="font-medium">{bookingData.passengerCount} orang</span></div>
            </div>
            <h5 className="font-bold text-gray-700 pt-3 border-t border-gray-100">Pilih Metode Pembayaran Simulasi:</h5>
            <div className="space-y-3">
              <button onClick={() => handlePayment('success')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-70 disabled:cursor-not-allowed"> {processing ? <Loader className="w-5 h-5 animate-spin" /> : <Shield className='w-5 h-5' />} {processing ? 'Memproses...' : 'Simulasi SUKSES'} </button>
              <button onClick={() => handlePayment('failure')} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-70 disabled:cursor-not-allowed"> {processing ? <Loader className="w-5 h-5 animate-spin" /> : <X className='w-5 h-5' />} {processing ? 'Memproses...' : 'Simulasi GAGAL'} </button>
            </div>
            <p className="text-xs text-gray-500 text-center pt-2">Simulasi ini hanya untuk demonstrasi alur.</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSeatMapModal = () => {
    if (!seatSelectionStatus.isOpen) return null;
    const { trainData, initialBookingDetails, selectedSeats } = seatSelectionStatus;
    const { passengerCount } = initialBookingDetails; const rows = 12; const columns = ['A', 'B', 'C', 'D'];
    const occupiedSeats = { '1A': 'male', '2B': 'female', '5D': 'male', '8A': 'male', '10C': 'female', '3C': 'male', '6B': 'female', '9D': 'male' };
    const toggleSeat = (seat) => {
      const isSelected = selectedSeats.includes(seat);
      if (isSelected) setSeatSelectionStatus(p => ({ ...p, selectedSeats: p.selectedSeats.filter(s => s !== seat) }));
      else if (selectedSeats.length < passengerCount) setSeatSelectionStatus(p => ({ ...p, selectedSeats: [...p.selectedSeats, seat] }));
    };
    const getSeatClass = (seat) => {
      if (occupiedSeats[seat]) return occupiedSeats[seat] === 'male' ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-pink-400 text-white cursor-not-allowed';
      if (selectedSeats.includes(seat)) return 'bg-blue-600 text-white border-blue-800 border-2 shadow-lg hover:bg-blue-700';
      return 'bg-white border border-gray-300 text-gray-800 hover:bg-blue-50 cursor-pointer';
    };
    const isSelectionComplete = selectedSeats.length === passengerCount;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl h-[90vh] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center shrink-0">
            <div>
              <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Train className='w-5 h-5 text-blue-600' /> Pilih Kursi ({trainData.name})</h4>
              <p className="text-sm text-gray-500">{trainData.origin} → {trainData.destination} | {formatDate(initialBookingDetails.date)}</p>
            </div>
            <button onClick={() => setSeatSelectionStatus(p => ({ ...p, isOpen: false }))} className="p-1 text-gray-500 hover:text-gray-700"><X className='w-5 h-5' /></button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex flex-wrap gap-4 justify-center text-xs mb-6 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-md bg-white border"></div>Tersedia</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-md bg-pink-400"></div>Terisi (W)</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-md bg-gray-500"></div>Terisi (P)</div>
                 <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-md bg-blue-600"></div>Terpilih</div>
                 <div className="flex items-center gap-1 font-bold text-blue-600"><Users className='w-4 h-4' /> Butuh {passengerCount} Kursi</div>
            </div>
            <div className="flex justify-center">
                <div className="bg-gray-200 p-4 rounded-lg shadow-inner max-w-max">
                    <div className="text-center mb-4 text-sm font-semibold text-gray-700">Depan</div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2"> {Array.from({ length: rows }, (_, i) => i + 1).map(row => ( <div key={row} className="flex gap-2 items-center"> <span className="text-xs w-6 text-right text-gray-600">{row}</span> {columns.slice(0, 2).map(col => { const seat = `${row}${col}`; return <button key={seat} onClick={() => toggleSeat(seat)} disabled={!!occupiedSeats[seat] || (!isSelectionComplete && selectedSeats.length >= passengerCount)} className={`w-8 h-8 rounded-md text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSeatClass(seat)}`}>{selectedSeats.includes(seat) ? <Check className='w-4 h-4 mx-auto' /> : col}</button>; })} </div> ))} </div>
                        <div className="w-8 flex items-center justify-center text-xs text-gray-500 font-bold border-l border-r border-gray-400">LAJUR</div>
                        <div className="flex flex-col gap-2"> {Array.from({ length: rows }, (_, i) => i + 1).map(row => ( <div key={row} className="flex gap-2 items-center"> {columns.slice(2, 4).map(col => { const seat = `${row}${col}`; return <button key={seat} onClick={() => toggleSeat(seat)} disabled={!!occupiedSeats[seat] || (!isSelectionComplete && selectedSeats.length >= passengerCount)} className={`w-8 h-8 rounded-md text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSeatClass(seat)}`}>{selectedSeats.includes(seat) ? <Check className='w-4 h-4 mx-auto' /> : col}</button>; })} </div> ))} </div>
                    </div>
                    <div className="text-center mt-4 text-sm font-semibold text-gray-700">Belakang</div>
                </div>
            </div>
          </div>
          <div className="p-4 border-t shrink-0">
            <p className={`text-center mb-3 font-semibold text-sm ${isSelectionComplete ? 'text-green-600' : 'text-yellow-600'}`}>{isSelectionComplete ? `✅ Kursi terpilih: ${selectedSeats.join(', ')}` : `⏳ Pilih lagi ${passengerCount - selectedSeats.length} kursi.`}</p>
            <button onClick={() => finalizeBookingAfterSeatSelection(selectedSeats, initialBookingDetails)} disabled={!isSelectionComplete} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"> <Check className='w-5 h-5' /> Konfirmasi & Lanjutkan </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSummaryModal = () => {
    if (!summaryModal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center">
                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Sparkles className='w-5 h-5 text-purple-600' /> Ringkasan Cerdas</h4>
                <button onClick={() => setSummaryModal({ isOpen: false, booking: null, loading: false, content: '' })} className="p-1 text-gray-500 hover:text-gray-700"><X className='w-5 h-5' /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {summaryModal.loading ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-600 p-8"> <Loader className="w-8 h-8 animate-spin text-purple-600 mb-4" /> <p className="font-semibold">KAIA sedang merangkum...</p> </div>
                ) : ( <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-purple-50 p-4 rounded-lg border border-purple-200">{summaryModal.content}</p> )}
            </div>
        </div>
      </div>
    );
  };

  const renderItineraryModal = () => {
    if (!itineraryModal.isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl h-[90vh] flex flex-col">
                <div className="p-5 border-b flex justify-between items-center shrink-0">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Compass className='w-5 h-5 text-green-600' /> Perencana Perjalanan AI</h4>
                    <button onClick={() => setItineraryModal({ isOpen: false, booking: null, loading: false, content: '', duration: 3 })} className="p-1 text-gray-500 hover:text-gray-700"><X className='w-5 h-5' /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {!itineraryModal.content && !itineraryModal.loading && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="font-bold text-green-800">Rencanakan Liburan di {itineraryModal.booking?.destination}!</p>
                            <p className="text-sm text-green-700 mt-1">Berapa lama Anda akan berlibur? KAIA akan membuatkan rencana perjalanan yang disesuaikan dengan jadwal Anda.</p>
                            <div className="mt-4 flex items-center gap-3">
                                <label htmlFor="duration" className="font-semibold text-gray-700">Jumlah Hari:</label>
                                <input type="number" id="duration" value={itineraryModal.duration} onChange={(e) => setItineraryModal(p => ({ ...p, duration: Math.max(1, parseInt(e.target.value)) }))} className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                                <button onClick={handleGenerateItinerary} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"> <Sparkles className="w-4 h-4" /> Buat Rencana </button>
                            </div>
                        </div>
                    )}
                    {itineraryModal.loading ? (
                        <div className="flex flex-col items-center justify-center text-center text-gray-600 p-8"> <Loader className="w-8 h-8 animate-spin text-green-600 mb-4" /> <p className="font-semibold">KAIA sedang menyusun petualangan impian Anda...</p> </div>
                    ) : itineraryModal.content && ( <div className="text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">{itineraryModal.content}</div> )}
                </div>
                 {itineraryModal.content && ( <div className="p-4 border-t shrink-0"> <button onClick={() => setItineraryModal(p => ({ ...p, loading: false, content: '' }))} className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"> Buat Rencana Baru </button> </div> )}
            </div>
        </div>
    );
  };

  const renderChatbot = () => (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${chatOpen ? 'w-full max-w-md' : 'w-auto'}`}>
      {!chatOpen ? (
        <button onClick={() => setChatOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center gap-3 group">
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" /> <span className="font-semibold hidden sm:inline">Chat dengan KAIA</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[70vh] max-h-[600px] border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold">KAIA</h3>
                <div className="flex items-center gap-2"> <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> <p className="text-xs text-blue-100">Online • Powered by Gemini</p> </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-2xl p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                    </div>
                     { msg.functionResult?.action?.startsWith('clarify_') && msg.data && Array.isArray(msg.data) && (
                        <div className="mt-3 space-y-2">
                          {msg.data.map((station) => (
                            <button 
                              key={station.code} 
                              onClick={() => handleClarificationResponse(station.code, msg.functionResult.originalQuery, msg.functionResult.action.split('_')[1])}
                              className="w-full text-left bg-white border border-gray-200 p-3 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                            >
                                <p className="font-semibold text-sm text-blue-700">{station.name}</p>
                                <p className="text-xs text-gray-500">{station.city}</p>
                            </button>
                          ))}
                        </div>
                    )}
                     { msg.functionResult?.action === 'suggest_alternative_route' && msg.data && (
                        <div className="mt-3">
                            <button 
                              onClick={() => handleAlternativeRouteResponse(msg.data)}
                              className="w-full bg-green-100 text-green-800 border border-green-200 p-3 rounded-lg hover:bg-green-200 transition font-semibold text-sm"
                            >
                                Ya, tampilkan jadwal rute alternatif
                            </button>
                        </div>
                    )}
                    { msg.functionCall === 'searchTrains' && msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-end items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                            <span className="text-xs font-semibold text-gray-600">Urutkan:</span>
                            <button onClick={() => handleSort(msg.id, 'departure')} className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-100">
                                Berangkat {msg.sortConfig.key === 'departure' && (msg.sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                            </button>
                            <button onClick={() => handleSort(msg.id, 'price')} className="flex items-center gap-1 text-xs bg-white border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-100">
                                Harga {msg.sortConfig.key === 'price' && (msg.sortConfig.direction === 'ascending' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                            </button>
                        </div>
                        {msg.data.map((train, index) => <React.Fragment key={train.id || index}>{renderTrainCard(train, true)}</React.Fragment>)}
                      </div>
                    )}
                    { (msg.functionCall === 'findBestTrain') && msg.data && !Array.isArray(msg.data) && (
                        <div className="mt-3">
                            {renderTrainCard(msg.data, true)}
                        </div>
                    )}
                    { (msg.functionCall === 'bookTicket' || msg.functionCall === 'cancelBooking') && msg.data && !Array.isArray(msg.data) && msg.data.id?.startsWith('BK') && ( <div className="mt-3">{renderBookingCard(msg.data)}</div> )}
                    { msg.functionCall === 'getUserBookings' && msg.data && Array.isArray(msg.data) && ( 
                      <div className="mt-3 space-y-2">
                        {msg.data.map((booking, index) => <React.Fragment key={booking.id || index}>{renderBookingCard(booking)}</React.Fragment>)}
                      </div> 
                    )}
                    { msg.functionCall === 'getTrainStatus' && msg.data && msg.data.timeline && ( <RealTimeJourneyTimeline journeyData={msg.data} /> )}
                    { msg.functionResult?.action === 'show_seat_map' && !seatSelectionStatus.isOpen && msg.data && ( <button onClick={() => setSeatSelectionStatus({ isOpen: true, trainData: mockDatabase.trains.find(t=>t.id === msg.data.trainId), initialBookingDetails: msg.data, selectedSeats: [] })} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"> <User className='w-4 h-4' /> Pilih Kursi ({msg.data.passengerCount} Pax) </button> )}
                    { msg.functionResult?.action === 'show_payment' && !paymentStatus.isOpen && msg.data && ( <button onClick={() => setPaymentStatus({ isOpen: true, bookingData: msg.data, processing: false, result: null })} className="mt-3 w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"> <CreditCard className='w-4 h-4' /> Lanjutkan ke Pembayaran </button> )}
                    { msg.functionResult?.action === 'show_feedback_options' && msg.data?.trainNumber && (
                        <div className="mt-3 space-y-2">
                            <button onClick={() => handleQuickAction(`Hubungkan saya ke kondektur kereta ${msg.data.trainNumber}`)} className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" /> Hubungi Kondektur
                            </button>
                            <button onClick={() => handleQuickAction('Hubungkan saya ke CS KAI pusat')} className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Hubungi CS KAI
                            </button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"> <Bot className="w-4 h-4 text-white" /> </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                    <div className="flex gap-1 items-center"> <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div> <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div> <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div> </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-semibold">💡 Coba tanyakan:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => handleQuickAction('Cari jadwal kereta api')} className="text-xs bg-white border border-gray-300 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-1"><Train className="w-3 h-3" />Cari Jadwal</button>
              <button onClick={() => handleQuickAction('Lacak status kereta 8')} className="text-xs bg-white border border-gray-300 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-1"><MapPin className="w-3 h-3" />Lacak Kereta</button>
              <button onClick={() => handleQuickAction('Lihat riwayat booking saya')} className="text-xs bg-white border border-gray-300 px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-1"><History className="w-3 h-3" />Booking Saya</button>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()} placeholder="Ketik pesan Anda..." disabled={isTyping || paymentStatus.isOpen || seatSelectionStatus.isOpen} className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping || paymentStatus.isOpen || seatSelectionStatus.isOpen} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"> {isTyping ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderHome = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4"> <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> <span className="text-sm text-blue-100">AI-Powered Booking System</span> </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Selamat Datang di<br/>KAI Intelligent Platform</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">Pengalaman booking tiket kereta yang lebih cerdas dengan bantuan AI. Chat dengan KAIA dalam bahasa Indonesia natural.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setChatOpen(true)} className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"><Bot className="w-5 h-5" />Mulai Chat dengan KAIA</button>
            <button onClick={() => handleQuickAction('Cari jadwal kereta api')} className="bg-blue-500/30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500/40 transition-all border border-white/20">Cari Tiket Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/90 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"><Train className="w-6 h-6 text-white" /></div>
              <div> <h1 className="text-xl font-bold text-gray-800">KAI Intelligent</h1> <p className="text-xs text-gray-500">Powered by AI</p> </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button onClick={() => handleQuickAction('Tampilkan booking saya')} className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"> <History className="w-5 h-5" /><span className="text-sm font-medium">Booking Saya</span> </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"><Bell className="w-5 h-5" /></button>
              <button onClick={() => setChatOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"> <Bot className="w-4 h-4" /><span className="hidden sm:inline">Chat KAIA</span> </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderHome()}
      </main>
      {renderChatbot()}
      {renderPaymentGateway()} 
      {renderSeatMapModal()}
      {renderSummaryModal()}
      {renderItineraryModal()}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-bounce { animation: bounce 1s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .prose { color: #374151; } .prose h1, .prose h2, .prose h3 { font-weight: 700; margin-bottom: 0.5em; }
        .prose ul { list-style-type: disc; padding-left: 1.5em; } .prose li { margin-bottom: 0.25em; }
      `}</style>
    </div>
  );
};

export default KAIIntelligentPlatform;

