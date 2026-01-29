"use client";

import { supabase } from "./supabase";

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  venue: string;
  audience?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getAllEvents() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) throw error;
    return data as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

export async function getEventById(id: string) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Event;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}

export async function createEvent(event: Omit<Event, "id" | "created_at" | "updated_at">) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("events")
      .insert([{
        ...event,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Event;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Event;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
