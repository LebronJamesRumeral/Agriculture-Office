"use client";

import { supabase } from "./supabase";
import type { Farmer } from "./farmers-service";

export interface Record {
  id: string;
  farmer_id: string;
  record_type: string; // harvest, assistance, training, etc.
  title: string;
  description?: string;
  record_date: string;
  amount?: number;
  quantity?: number;
  unit?: string; // kg, tons, sacks, etc.
  status: "active" | "inactive";
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  farmer?: Farmer;
}

export async function getAllRecords() {
  try {
    const { data, error } = await supabase
      .from("records")
      .select(`
        *,
        farmer:farmers(*)
      `)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return data as Record[];
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
}

export async function getRecordById(id: string) {
  try {
    const { data, error } = await supabase
      .from("records")
      .select(`
        *,
        farmer:farmers(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Record;
  } catch (error) {
    console.error("Error fetching record:", error);
    throw error;
  }
}

export async function getFarmerRecords(farmerId: string) {
  try {
    const { data, error } = await supabase
      .from("records")
      .select(`
        *,
        farmer:farmers(*)
      `)
      .eq("farmer_id", farmerId)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return data as Record[];
  } catch (error) {
    console.error("Error fetching farmer records:", error);
    throw error;
  }
}

export async function createRecord(record: Omit<Record, "id" | "created_at" | "updated_at" | "farmer">) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("records")
      .insert([{
        ...record,
        created_by: user?.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Record;
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
}

export async function updateRecord(id: string, updates: Partial<Record>) {
  try {
    const { data, error } = await supabase
      .from("records")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Record;
  } catch (error) {
    console.error("Error updating record:", error);
    throw error;
  }
}

export async function deleteRecord(id: string) {
  try {
    const { error } = await supabase
      .from("records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting record:", error);
    throw error;
  }
}

export async function getRecordsByType(recordType: string) {
  try {
    const { data, error } = await supabase
      .from("records")
      .select(`
        *,
        farmer:farmers(*)
      `)
      .eq("record_type", recordType)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return data as Record[];
  } catch (error) {
    console.error("Error fetching records by type:", error);
    throw error;
  }
}
