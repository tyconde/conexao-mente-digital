
import { useState, useEffect } from "react";

interface WeekSchedule {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface ProfessionalSettings {
  schedule: WeekSchedule;
  attendanceTypes: {
    presencial: boolean;
    remoto: boolean;
  };
  address: string;
}

const weekDaysMap: { [key: number]: string } = {
  0: "sunday",
  1: "monday", 
  2: "tuesday",
  3: "wednesday",
  4: "thursday", 
  5: "friday",
  6: "saturday"
};

export const useAvailableSlots = (professionalId: number) => {
  const [professionalSettings, setProfessionalSettings] = useState<ProfessionalSettings | null>(null);

  useEffect(() => {
    if (professionalId) {
      const savedSettings = localStorage.getItem(`professional_settings_${professionalId}`);
      if (savedSettings) {
        setProfessionalSettings(JSON.parse(savedSettings));
      }
    }
  }, [professionalId]);

  const isDateAvailable = (dateStr: string): boolean => {
    if (!professionalSettings) return false;
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dayKey = weekDaysMap[dayOfWeek];
    
    return professionalSettings.schedule[dayKey]?.enabled || false;
  };

  const isTimeAvailable = (dateStr: string, timeStr: string): boolean => {
    if (!professionalSettings || !isDateAvailable(dateStr)) return false;
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dayKey = weekDaysMap[dayOfWeek];
    const daySchedule = professionalSettings.schedule[dayKey];
    
    if (!daySchedule || !daySchedule.enabled) return false;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    const [startHours, startMinutes] = daySchedule.start.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    
    const [endHours, endMinutes] = daySchedule.end.split(':').map(Number);
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
  };

  const getAvailableDays = (): string[] => {
    if (!professionalSettings) return [];
    
    const availableDays: string[] = [];
    Object.entries(professionalSettings.schedule).forEach(([day, schedule]) => {
      if (schedule.enabled) {
        availableDays.push(day);
      }
    });
    
    return availableDays;
  };

  const getDaySchedule = (dayKey: string) => {
    if (!professionalSettings) return null;
    return professionalSettings.schedule[dayKey];
  };

  return {
    professionalSettings,
    isDateAvailable,
    isTimeAvailable,
    getAvailableDays,
    getDaySchedule,
  };
};
