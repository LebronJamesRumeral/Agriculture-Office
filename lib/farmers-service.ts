"use client";

import { supabase } from "./supabase";

export interface Farmer {
  id: string;
  qr_code: string;
  full_name: string;
  farmer_type: "farmer" | "fisherfolk";
  phone?: string;
  email?: string;
  address: string;
  municipality: string;
  barangay: string;
  crop_type?: string;
  farm_size?: number;
  fishing_vessel?: string;
  registration_date: string;
  status: "active" | "inactive";
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export async function getAllFarmers() {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Farmer[];
  } catch (error) {
    console.error("Error fetching farmers:", error);
    throw error;
  }
}

export async function getFarmerById(id: string) {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Farmer;
  } catch (error) {
    console.error("Error fetching farmer:", error);
    throw error;
  }
}

export async function getFarmerByQRCode(qrCode: string) {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (error) throw error;
    return data as Farmer;
  } catch (error) {
    console.error("Error fetching farmer by QR:", error);
    throw error;
  }
}

export async function createFarmer(farmer: Omit<Farmer, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .insert([farmer])
      .select()
      .single();

    if (error) throw error;
    return data as Farmer;
  } catch (error) {
    console.error("Error creating farmer:", error);
    throw error;
  }
}

export async function updateFarmer(id: string, updates: Partial<Farmer>) {
  try {
    const { data, error } = await supabase
      .from("farmers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Farmer;
  } catch (error) {
    console.error("Error updating farmer:", error);
    throw error;
  }
}

export async function deleteFarmer(id: string) {
  try {
    const { error } = await supabase
      .from("farmers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting farmer:", error);
    throw error;
  }
}

export async function generateQRCode(farmerId: string): string {
  // Generate unique QR code for farmer
  return `FARMER-${farmerId}-${Date.now()}`;
}
