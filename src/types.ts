export type Cook = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  serviceArea: string;
  availability: string;
  createdAt: string;
  status: "available" | "matched";
};

export type Match = {
  id: string;
  cookId: string;
  cookName: string;
  customerName: string;
  customerEmail: string;
  mealNotes: string;
  preferredDate: string;
  createdAt: string;
};
