// utils/uploadImage.js
import { supabase } from "@/lib/supabase";

export const uploadImage = async (file) => {
  const fileName = `uploads/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("trusthive")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("trusthive")
    .getPublicUrl(fileName);

  return data.publicUrl;
};