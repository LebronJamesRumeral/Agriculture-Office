"use client";

import { supabase } from "./supabase";
import type { Farmer } from "./farmers-service";
import type { Event } from "./events-service";

export interface EventAttendance {
  id: string;
  event_id: string;
  farmer_id: string;
  attendance_time: string;
  notes?: string;
  // Joined data
  farmer?: Farmer;
  event?: Event;
}

export async function recordAttendance(eventId: string, farmerId: string, notes?: string) {
  try {
    const { data, error } = await supabase
      .from("event_attendance")
      .insert([{
        event_id: eventId,
        farmer_id: farmerId,
        notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as EventAttendance;
  } catch (error) {
    console.error("Error recording attendance:", error);
    throw error;
  }
}

export async function getEventAttendance(eventId: string) {
  try {
    const { data, error } = await supabase
      .from("event_attendance")
      .select(`
        *,
        farmer:farmers(*),
        event:events(*)
      `)
      .eq("event_id", eventId)
      .order("attendance_time", { ascending: false });

    if (error) throw error;
    return data as EventAttendance[];
  } catch (error) {
    console.error("Error fetching event attendance:", error);
    throw error;
  }
}

export async function getFarmerAttendance(farmerId: string) {
  try {
    const { data, error } = await supabase
      .from("event_attendance")
      .select(`
        *,
        event:events(*),
        farmer:farmers(*)
      `)
      .eq("farmer_id", farmerId)
      .order("attendance_time", { ascending: false });

    if (error) throw error;
    return data as EventAttendance[];
  } catch (error) {
    console.error("Error fetching farmer attendance:", error);
    throw error;
  }
}

export async function checkAttendance(eventId: string, farmerId: string) {
  try {
    const { data, error } = await supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", eventId)
      .eq("farmer_id", farmerId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data as EventAttendance | null;
  } catch (error) {
    console.error("Error checking attendance:", error);
    throw error;
  }
}

export async function deleteAttendance(id: string) {
  try {
    const { error } = await supabase
      .from("event_attendance")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throw error;
  }
}
