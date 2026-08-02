'use client';

import React from 'react';
import { PatientDetails } from '@/types';
import { User, Phone, MapPin, Calendar, ArrowRight, ArrowLeft, Users } from 'lucide-react';

interface DetailsStepProps {
  details: PatientDetails;
  onChangeDetails: (details: PatientDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DetailsStep({ details, onChangeDetails, onNext, onBack }: DetailsStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.age || !details.phone || !details.location) {
      alert('Please fill in all required patient details.');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
          <User className="w-4 h-4" /> Step 2 of 4
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Patient Demographics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter basic details to create your clinical intake token.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>Full Name <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rameshbhai Patel / Sunita Sharma"
            value={details.name}
            onChange={(e) => onChangeDetails({ ...details, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm transition-all"
          />
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Age (Years) <span className="text-red-500">*</span></span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              placeholder="e.g. 45"
              value={details.age}
              onChange={(e) => onChangeDetails({ ...details, age: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Gender <span className="text-red-500">*</span></span>
            </label>
            <select
              value={details.gender}
              onChange={(e) => onChangeDetails({ ...details, gender: e.target.value as PatientDetails['gender'] })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Mobile Phone Number <span className="text-red-500">*</span></span>
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. +91 98765 43210"
            value={details.phone}
            onChange={(e) => onChangeDetails({ ...details, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm transition-all"
          />
        </div>

        {/* Village / City Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Village / City / District <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Anand, Gujarat / Jaipur, Rajasthan"
            value={details.location}
            onChange={(e) => onChangeDetails({ ...details, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm transition-all"
          />
        </div>

        {/* Step Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <span>Continue to Health Complaints</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
