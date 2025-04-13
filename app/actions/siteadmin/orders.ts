"use server"
import { createClient } from "@/utils/supabase/server";

// Reusable Orders type
export type Orders = {
    id: number;
    user_id: string;
    package_id: number | null;
    transaction_id: number | null;
    status: "received" | "preparing" | "packing" | "shipped" | "delivered";
    tracking_id: string | null;
    ordered_at: string;
    updated_at: string;
};


// Get all orders
export async function getAllOrders() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("ordered_at", { ascending: false });
    if (error) throw error;
    return data as Orders[];
}

// Get order by ID
export async function getOrderById(id: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data as Orders;
}

// Get orders by customer/user ID
export async function getOrdersByUserId(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("ordered_at", { ascending: false });
    if (error) throw error;
    return data as Orders[];
}

// Get orders by package ID
export async function getOrdersByPackageId(packageId: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("package_id", packageId);
    if (error) throw error;
    return data as Orders[];
}

// Get orders by transaction ID
export async function getOrdersByTransactionId(transactionId: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("transaction_id", transactionId);
    if (error) throw error;
    return data as Orders[];
}

// Update order by ID
export async function updateOrderById(id: number, updates: Partial<Orders>) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data;
}




// Create
export async function createOrder(order: Omit<Orders, "id" | "ordered_at" | "updated_at">) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();
    if (error) throw error;
    return data;
}



// Delete order by ID
export async function deleteOrderById(id: number) {
    const supabase = await createClient();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
}
