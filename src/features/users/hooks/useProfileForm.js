import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../validations/profileSchema";
import { useUpdateProfile } from "./useUpdateProfile";

function normalizeLocationForForm(location) {
  if (!location) return null;

  if (
    typeof location === "object" &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2
  ) {
    return {
      lat: Number(location.coordinates[1]),
      lng: Number(location.coordinates[0]),
      address: location.address || "",
    };
  }

  if (
    typeof location === "object" &&
    Number.isFinite(Number(location.lat)) &&
    Number.isFinite(Number(location.lng))
  ) {
    return {
      lat: Number(location.lat),
      lng: Number(location.lng),
      address: location.address || "",
    };
  }

  return null;
}

function normalizeSkillsForForm(skills) {
  if (Array.isArray(skills)) {
    return skills.join(", ");
  }

  if (typeof skills === "string") {
    return skills;
  }

  return "";
}

function normalizeLocationForApi(location) {
  if (!location || typeof location !== "object") {
    return undefined;
  }

  if (
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    Number.isFinite(Number(location.coordinates[0])) &&
    Number.isFinite(Number(location.coordinates[1]))
  ) {
    const lng = Number(location.coordinates[0]);
    const lat = Number(location.coordinates[1]);
    const address =
      typeof location.address === "string" ? location.address.trim() : "";

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !address) {
      return undefined;
    }

    return {
      type: "Point",
      coordinates: [lng, lat],
      address,
    };
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const address =
    typeof location.address === "string" ? location.address.trim() : "";

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !address) {
    return undefined;
  }

  return {
    type: "Point",
    coordinates: [lng, lat],
    address,
  };
}

function normalizeSkillsForApi(skills) {
  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }

  if (typeof skills !== "string") {
    return [];
  }

  return skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const useProfileForm = (initialData, onSuccessCallback) => {
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const formattedInitialData = useMemo(
    () =>
      initialData
        ? {
            fullName: initialData.fullName || "",
            phone: initialData.phone || "",
            location: normalizeLocationForForm(initialData.location),
            headline: initialData.headline || "",
            about: initialData.about || "",
            skills: normalizeSkillsForForm(initialData.skills),
          }
        : {
            fullName: "",
            phone: "",
            location: null,
            headline: "",
            about: "",
            skills: "",
          },
    [initialData]
  );

  const form = useForm({
    resolver: zodResolver(profileSchema),
    values: formattedInitialData,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        fullName: data.fullName?.trim() || "",
        phone: data.phone?.trim() || "",
        location: normalizeLocationForApi(data.location),
        headline: data.headline?.trim() || "",
        about: data.about?.trim() || "",
        skills: normalizeSkillsForApi(data.skills),
      };

      await updateProfile(payload);

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (error) {
      console.error("[ProfileForm] Submission failed:", error);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isPending,
  };
};

export default useProfileForm;