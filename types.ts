// FIX: Removed self-import which was causing declaration conflicts.
export enum Role {
  Pathfinder = 'Desbravador',
  Instructor = 'Instrutor',
  Leader = 'Líder',
}

export enum PixKeyType {
  CPF = 'CPF',
  Email = 'E-mail',
  Phone = 'Celular',
  Random = 'Chave Aleatória',
  ID = 'ID Stahl',
}

export interface PixKey {
  type: PixKeyType;
  key: string;
  isDeleted?: boolean;
}

export enum TransactionType {
  Sent = 'Enviada',
  Received = 'Recebida',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  timestamp: string; // ISO 8601 string
  pixKeyUsed?: string;
}


export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Storing passwords on the client is not secure, this is for demo purposes
  dateOfBirth: string;
  role: Role;
  age: number;
  profilePictureUrl?: string;
  
  // Pathfinder specific
  achievements?: string[];
  classProgress?: ClassProgress;
  dollars?: number;
  tasks?: Task[];
  qrCodeValue: string;
  pixKeys?: PixKey[];
  transactions?: Transaction[];

  // Instructor/Leader specific
  motherName?: string;
  fatherName?: string;
  cpf?: string;
  cep?: string;
  phone?: string;
  
  // New Profile Fields
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  clubUnit?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não dizer';
  bio?: string;
}

export interface ClassProgress {
  signatures: number;
  totalSignatures: number;
  life: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dollarReward: number;
  completed: boolean;
  dueDate?: string; // ISO 8601 string for due date
  submission?: {
    message: string;
    imageUrl?: string;
    timestamp: string;
  };
  isDeleted?: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  date: string;
  isDeleted?: boolean;
}

export interface Visit {
  id: string;
  visitorName: string;
  visitorPhone: string;
  invitedById: string; 
  invitedByName: string;
  visitDate: string; // ISO 8601 string
}