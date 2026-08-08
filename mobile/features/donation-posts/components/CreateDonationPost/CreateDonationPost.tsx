import React, { useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationPostSchema, DonationPostFormData } from "@/schemas/donationPost.schema";
import FormInput from "@/components/ui/FormInput";
import FormPicker from "@/components/ui/FormPicker";
import { useCreateDonationPost } from "@/hooks/useCreateDonationPost";
import { COLORS, SIZES } from "@/constants";
import { BLOOD_TYPE_OPTIONS } from "@/constants/bloodTypes";
import styles from "./CreateDonationPost.styles";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const DONATION_TYPES = ["Blood", "Bone Marrow", "Heart", "liver", "Kidney", "Lung", "Tissue"];
const CITIES = ["Santa Cruz", "Cochabamba", "La Paz", "Oruro", "Potosi", "Sucre", "Tarija", "Trinidad", "Cobija", "Riberalta", "Yacuiba"];

export default function CreateDonationPost() {
  const router = useRouter();
  const { mutate, isPending, isSuccess, error } = useCreateDonationPost();

  const { control, handleSubmit, formState: { isValid } } = useForm<DonationPostFormData>({
    resolver: zodResolver(donationPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      city: "",
      hospital: "",
      bloodTypeId: "",
      donationTypeId: "",
      mobile: "",
      description: "",
    },
  });

  const onSubmit = (data: DonationPostFormData) => {
    mutate(data);
  };

  useEffect(() => {
    if (isSuccess) {
      Alert.alert("Success", "Your donation request has been posted!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error.message || "Failed to create request. Please try again.");
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: COLORS.black }}>
            Create a Request
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.secondaryGray, marginTop: 4 }}>
            Fill in the details to request donation.
          </Text>
        </View>
        <FormInput 
          control={control} 
          name="title" 
          label="Title *" 
          placeholder="Enter a title..."
        />
        <FormPicker 
          control={control} 
          name="donationTypeId" 
          label="Donation Type *" 
          options={DONATION_TYPES} 
          placeholder="Select donation type" 
        />
        <FormPicker control={control} name="bloodTypeId" label="Blood Type *" options={BLOOD_TYPES} placeholder="Select blood type" />
        <FormPicker control={control} name="city" label="City *" options={CITIES} placeholder="Select city" />
        <FormInput control={control} name="hospital" label="Hospital / Center *" placeholder="Enter hospital or center" />
        <FormInput control={control} name="mobile" label="Mobile Number *" placeholder="Enter mobile number" keyboardType="phone-pad" />
        <FormInput control={control} name="description" label="Add a note (optional)" placeholder="Additional information..." multiline numberOfLines={4} />
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || isPending) && styles.submitDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {isPending ? "Submitting..." : "Request"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
