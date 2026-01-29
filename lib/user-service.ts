"use client";

import { supabase } from "./supabase";

export interface UserProfile {
  id?: string;
  email: string;
  full_name?: string;
  role: "farmer" | "officer" | "admin";
  phone?: string;
  address?: string;
  municipality?: string;
  barangay?: string;
}

export async function createUserProfile(profile: UserProfile) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([profile])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
