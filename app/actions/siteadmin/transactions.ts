"use server"
import { createClient } from "@/utils/supabase/server"

// Reusable Transactions type
export type Transactions = {
    id: number
    user_id: string
    package_id: number | null
    stripe_payment_intent_id: string | null
    stripe_checkout_session_id: string | null
    stripe_customer_id: string | null
    stripe_receipt_url: string | null
    amount: number
    currency: string
    status: string
    created_at: string
    updated_at: string
}

// Get all transactions
export async function getAllTransactions() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
    if (error) throw error
    return data as Transactions[]
}

// Get transaction by ID
export async function getTransactionById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single()
    if (error) throw error
    return data as Transactions
}

// Get transactions by user ID
export async function getTransactionsByUserId(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    if (error) throw error
    return data as Transactions[]
}

// Get transactions by package ID
export async function getTransactionsByPackageId(packageId: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("package_id", packageId)
        .order("created_at", { ascending: false })
    if (error) throw error
    return data as Transactions[]
}

// Update transaction by ID
export async function updateTransactionById(id: number, updates: Partial<Transactions>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("transactions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data as Transactions
}




// Create transaction
export async function createTransaction(data: Omit<Transactions, "id" | "created_at" | "updated_at">) {
    const supabase = await createClient()
    const { data: created, error } = await supabase
        .from("transactions")
        .insert([data])
        .select()
        .single()
    if (error) throw error
    return created as Transactions
}


// Delete transaction by ID
export async function deleteTransactionById(id: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
    if (error) throw error
    return true
}