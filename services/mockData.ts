import type { User, Event, Task, Transaction } from '../types';
import { Role, PixKeyType, TransactionType } from '../types';

export const MOCK_GLOBAL_TASKS: Task[] = [];

const MOCK_TRANSACTIONS_JOAO: Transaction[] = [
    {
        id: 'txn1', type: TransactionType.Received, amount: 50,
        senderName: 'Ana Costa', receiverName: 'João Silva',
        senderId: 'STAHL-303323', receiverId: 'STAHL-101121',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        pixKeyUsed: 'ana.costa@example.com'
    }
];

const MOCK_TRANSACTIONS_MARIA: Transaction[] = [
    {
        id: 'txn2', type: TransactionType.Received, amount: 25,
        senderName: 'Ana Costa', receiverName: 'Maria Oliveira',
        senderId: 'STAHL-303323', receiverId: 'STAHL-202222',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        pixKeyUsed: 'ana.costa@example.com'
    }
];


export const MOCK_USERS: User[] = [
  {
    id: 'STAHL-101121',
    fullName: 'João Silva',
    email: 'joao.silva@example.com',
    password: 'password',
    dateOfBirth: '2010-05-15',
    role: Role.Pathfinder,
    age: 14,
    achievements: ['Acampamento Mestre', 'Especialidade de Primeiros Socorros'],
    classProgress: { signatures: 350, totalSignatures: 500, life: 70 },
    dollars: 1250,
    tasks: [],
    qrCodeValue: 'stahl-app-user-STAHL-101121',
    pixKeys: [
        { type: PixKeyType.ID, key: 'STAHL-101121'},
        { type: PixKeyType.Email, key: 'joao.silva@example.com' },
        { type: PixKeyType.Random, key: 'abc-123-def-456' }
    ],
    transactions: MOCK_TRANSACTIONS_JOAO,
    cpf: '111.222.333-44',
    cep: '01001-000',
    address: 'Praça da Sé, S/N - Sé, São Paulo - SP',
    phone: '(11) 99999-1111',
    motherName: 'Mariana Silva',
    fatherName: 'Roberto Silva',
    emergencyContactName: 'Mariana Silva',
    emergencyContactPhone: '(11) 99999-1111',
    bio: 'Desbravador dedicado, sempre pronto para uma nova aventura.',
    clubUnit: 'Falcão',
    gender: 'Masculino',
  },
  {
    id: 'STAHL-202222',
    fullName: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    password: 'password',
    dateOfBirth: '2011-02-20',
    role: Role.Pathfinder,
    age: 13,
    achievements: ['Especialidade de Culinária'],
    classProgress: { signatures: 220, totalSignatures: 500, life: 44 },
    dollars: 800,
    tasks: [],
    qrCodeValue: 'stahl-app-user-STAHL-202222',
    pixKeys: [
        { type: PixKeyType.ID, key: 'STAHL-202222' },
        { type: PixKeyType.Email, key: 'maria.oliveira@example.com' },
    ],
    transactions: MOCK_TRANSACTIONS_MARIA,
    clubUnit: 'Panda',
  },
  {
    id: 'STAHL-303323',
    fullName: 'Ana Costa',
    dateOfBirth: '1990-08-25',
    role: Role.Instructor,
    age: 33,
    motherName: 'Rita Costa',
    fatherName: 'Carlos Costa',
    cpf: '123.456.789-00',
    cep: '12345-678',
    phone: '(11) 98765-4321',
    email: 'ana.costa@example.com',
    password: 'password',
    qrCodeValue: 'stahl-app-user-STAHL-303323',
    dollars: 999999, // Infinite dollars for instructor
    pixKeys: [
        { type: PixKeyType.ID, key: 'STAHL-303323' },
        { type: PixKeyType.Email, key: 'ana.costa@example.com' }
    ],
    transactions: []
  },
  {
    id: 'STAHL-404424',
    fullName: 'Pedro Martins',
    dateOfBirth: '1985-03-10',
    role: Role.Leader,
    age: 39,
    motherName: 'Lúcia Martins',
    fatherName: 'Jorge Martins',
    cpf: '987.654.321-00',
    cep: '87654-321',
    phone: '(11) 91234-5678',
    email: 'pedro.martins@example.com',
    password: 'password',
    qrCodeValue: 'stahl-app-user-STAHL-404424',
    dollars: 10000,
    pixKeys: [
        { type: PixKeyType.ID, key: 'STAHL-404424' },
        { type: PixKeyType.Email, key: 'pedro.martins@example.com' }
    ],
    transactions: []
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Acampamento de Verão 2024',
    description: 'Um fim de semana de muita aventura, aprendizado e amizade na Serra da Cantareira.',
    imageUrl: 'https://picsum.photos/seed/camp2024/800/400',
    date: '2024-12-15',
  },
  {
    id: 2,
    title: 'Feira de Especialidades',
    description: 'Apresentação das especialidades concluídas e oportunidade de começar novas.',
    imageUrl: 'https://picsum.photos/seed/fair2024/800/400',
    date: '2024-11-20',
  },
];