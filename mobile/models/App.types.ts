// One page of a list endpoint (every GET list in the API since US-API-18).
export type PagedResult<T> = {
    items: T[],
    page: number,
    pageSize: number,
    totalCount: number,
    totalPages: number,
}

// Who wrote a post or comment: public fields only.
export type Author = {
    id: string,
    fullName: string,
    image?: string,
}

export type Comment = {
    id?: string,
    description: string,
    donationPostId?: string,
    createdAt?: string,
    updatedAt?: string,
    user?: Author,
}

export type Donation = {
    id: number,
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
    id?: string,
    urgent: boolean,
    title: string,
    description: string,    
    bloodTypeId?: string,
    bloodType?: BloodType,
    donationTypeId?: string,
    donationType?: Donation,
    userId?: string,
    user?: Author,
    donationCenterId?: string,
    donationCenter?: DonationCenter,
    comments: Comment[],
    commentCount?: number,
    image?: string,
    createdAt: string,
    updatedAt: string,
}

export type User = {
    id: number,
    fullName: string,
    email: string,
    bloodType: BloodType,
    password: string,
    address: string,
    phoneNumber: string,
    image?: string,
    dateOfBirth: string,
    latitude: number,
    longitude: number,
    donationPosts?: Donation[],
}

// Public donor card from GET /api/donors. Other users' address, phone, email, date of birth and
// exact location are never sent to the app; a user sees their own full profile via /api/me.
export type Donor = {
    id: string,
    fullName: string,
    image?: string,
    city?: string,
    bloodTypeId: string,
    bloodType?: BloodType,
}

export type BloodType = {
    id?: number,
    name: string,       
    image: string,
}

export type DonationCenter = {
    id: number,
    name: string,
    address: string,
    email: string,
    openingHours: string,
    phone: string,
    image: string,
    city: string,
    latitude: number,
    longitude: number,
    donationTypes?: Donation[],
    donationTypeIds?: number[],
}

export enum Status {
    Active = 1,
    Inactive = 2
}

export type Props = {
    children?: React.ReactNode;
};
