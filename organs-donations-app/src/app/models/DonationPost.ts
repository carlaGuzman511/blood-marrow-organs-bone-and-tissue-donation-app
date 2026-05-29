export type Comment = {
    id?: string,
    description: string,
    donationPostId?: string,
    createdAt?: string,
    updatedAt?: string,
}

export type Donation = {
    id?: string,
    name: string,
    description: string,
    requirements: string,
    process: string,
    importance: string,
    benefits: string,
    secondaryEffects: string,
    image?: string,
}

export type DonationPost = {
    id: string,
    description?: string,    
    bloodTypeId?: string,
    bloodType?: BloodType,
    donationTypeId?: string,
    donationType?: Donation,
    userId?: string,
    user?: User,    
    donationCenterId?: string,
    donationCenter?: DonationCenter,
    comments?: Comment[],
    image?: string,
    createdAt?: string,
    updatedAt?: string,
}

export type User = {
    id: string,
    fullName: string,
    email: string,
    bloodTypeId: string,
    password: string,
    address: string,
    phoneNumber: string,
    image?: string,
    dateOfBirth: string,
    latitude: number,
    longitude: number,
    donationPosts?: Donation[],
}

export type BloodType = {
    id: string,
    name: string,       
    image: string,
}

export type DonationCenter = {
    id: string,
    name: string,
    address: string,
    image: string,
    city: string,
    latitude: number,
    longitude: number,
    donationTypes?: Donation[],
    donationTypeIds?: number[],
}

export type City = {
    id?: string,
    name: string,
}

export enum Status {
    Active = 1,
    Inactive = 2
}
