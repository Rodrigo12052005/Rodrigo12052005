import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// FIX: Import the Role enum to use its members as values.
// FIX: Import PixKeyType to use its members as values.
import { Role, type User, type Event, type PixKey, Transaction, TransactionType, PixKeyType, Task, Visit } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_GLOBAL_TASKS } from '../services/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  // FIX: Allow `role` to be passed in `registerUser` by removing it from Omit.
  registerUser: (newUser: Omit<User, 'id' | 'qrCodeValue'>, options?: { loginAfterRegister?: boolean }) => { success: boolean, message: string };
  login: (email: string, password: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  updatePassword: (userId: string, oldPass: string, newPass: string) => { success: boolean, message: string };
  deleteUser: (userId: string) => { success: boolean, message: string };
  events: Event[];
  addEvent: (newEvent: Event) => void;
  updateEvent: (updatedEvent: Event) => void;
  deleteEvent: (eventId: number) => { success: boolean, message: string };
  restoreEvent: (eventId: number) => { success: boolean, message: string };
  permanentlyDeleteEvent: (eventId: number) => { success: boolean, message: string };
  addPixKey: (userId: string, key: PixKey) => { success: boolean, message: string };
  removePixKey: (userId: string, key: string) => { success: boolean, message: string };
  restorePixKey: (userId: string, key: string) => { success: boolean; message: string; };
  permanentlyRemovePixKey: (userId: string, key: string) => { success: boolean; message: string; };
  sendDollars: (senderId: string, receiverKey: string, amount: number) => { success: boolean, message: string };
  isInitialized: boolean;
  tasks: Task[];
  addTaskToAllPathfinders: (taskDetails: Omit<Task, 'id' | 'completed'>) => { success: boolean; message: string; };
  updateTask: (updatedTask: Task) => { success: boolean; message: string; };
  deleteTask: (taskId: number) => { success: boolean; message: string; };
  restoreTask: (taskId: number) => { success: boolean; message: string; };
  permanentlyDeleteTask: (taskId: number) => { success: boolean; message: string; };
  completeUserTask: (userId: string, taskId: number, submission: { message: string; imageUrl?: string; }) => { success: boolean; message: string; };
  rejectUserTask: (userId: string, taskId: number) => { success: boolean; message: string; };
  adjustPathfinderProgress: (userId: string, adjustmentAmount: number) => { success: boolean, message: string };
  visits: Visit[];
  addVisit: (visit: Omit<Visit, 'id'>) => { success: boolean, message: string };
  addAchievement: (userId: string, achievement: string) => { success: boolean, message: string };
  removeAchievement: (userId: string, achievementIndex: number) => { success: boolean, message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'stahl_users';
const TASKS_STORAGE_KEY = 'stahl_tasks';
const EVENTS_STORAGE_KEY = 'stahl_events';
const LOGGED_IN_USER_KEY = 'stahl_loggedInUser';
const VISITS_STORAGE_KEY = 'stahl_visits';


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
      setUsers(allUsers);
      
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      setTasks(storedTasks ? JSON.parse(storedTasks) : MOCK_GLOBAL_TASKS);

      const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
      setEvents(storedEvents ? JSON.parse(storedEvents) : MOCK_EVENTS);

      const loggedInUserId = localStorage.getItem(LOGGED_IN_USER_KEY);
      if (loggedInUserId) {
        const user = allUsers.find((u: User) => u.id === loggedInUserId);
        if (user) {
          setCurrentUser(user);
        }
      }

      const storedVisits = localStorage.getItem(VISITS_STORAGE_KEY);
      setVisits(storedVisits ? JSON.parse(storedVisits) : []);

    } catch (error) {
      console.error("Failed to initialize user data from localStorage", error);
      setUsers(MOCK_USERS);
      setTasks(MOCK_GLOBAL_TASKS);
      setEvents(MOCK_EVENTS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const persistUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };
  
  const persistTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
  };

  const persistEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  };
  
  const persistVisits = (updatedVisits: Visit[]) => {
    setVisits(updatedVisits);
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(updatedVisits));
  };

  const login = (email: string, password: string): { success: boolean, message: string, user?: User } => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      if (user.role === Role.Instructor) {
          return { success: false, message: 'Acesso de instrutor deve ser feito pelo botão "MODO INSTRUTOR".' };
      }
      setCurrentUser(user);
      localStorage.setItem(LOGGED_IN_USER_KEY, user.id);
      return { success: true, message: 'Login successful!', user };
    }
    return { success: false, message: 'E-mail ou senha inválidos.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  };

  const generateUniqueStahlId = (existingUsers: User[]): string => {
    let newId = '';
    let isUnique = false;
    while (!isUnique) {
        newId = `STAHL-${Math.floor(100000 + Math.random() * 900000)}`;
        if (!existingUsers.some(u => u.id === newId)) {
            isUnique = true;
        }
    }
    return newId;
  };

  // FIX: Allow `role` to be passed in `registerUser` by removing it from Omit.
  const registerUser = (newUserPartial: Omit<User, 'id' | 'qrCodeValue'>, options: { loginAfterRegister?: boolean } = { loginAfterRegister: true }): { success: boolean, message: string } => {
    if (users.some(u => u.email.toLowerCase() === newUserPartial.email.toLowerCase())) {
        return { success: false, message: 'Este e-mail já está em uso.' };
    }
    
    const id = generateUniqueStahlId(users);
    const newUser: User = {
        ...newUserPartial,
        id,
        // FIX: Use the Role enum member for the default role to ensure type safety.
        role: newUserPartial.role || Role.Pathfinder,
        qrCodeValue: `stahl-app-user-${id}`,
        // FIX: Use PixKeyType enum instead of string literal for type safety.
        pixKeys: [
          { type: PixKeyType.ID, key: id },
          { type: PixKeyType.Email, key: newUserPartial.email }
        ],
        transactions: [],
        dollars: 50,
        tasks: tasks.map(t => ({...t})), // Assign a copy of current global tasks
    };
    
    const updatedUsers = [...users, newUser];
    persistUsers(updatedUsers);
    
    if (options.loginAfterRegister) {
      // Set the new user as the currently logged-in user
      setCurrentUser(newUser);
      localStorage.setItem(LOGGED_IN_USER_KEY, newUser.id);
    }

    return { success: true, message: 'Usuário criado com sucesso!' };
  };
  
  const addEvent = (newEvent: Event) => {
    const updatedEvents = [...events, newEvent];
    persistEvents(updatedEvents);
  };
  
  const updateEvent = (updatedEvent: Event) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    persistEvents(updatedEvents);
  };

  const deleteEvent = (eventId: number): { success: boolean, message: string } => {
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: 'Evento não encontrado.' };
    }
    
    // Create new array with a new object for the modified item to ensure state update.
    const updatedEvents = [...events];
    const eventToUpdate = updatedEvents[eventIndex];
    updatedEvents[eventIndex] = { ...eventToUpdate, isDeleted: true };
    
    persistEvents(updatedEvents);
    return { success: true, message: 'Evento movido para a lixeira.' };
  };

  const restoreEvent = (eventId: number): { success: boolean, message: string } => {
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        return { success: false, message: 'Evento não encontrado.' };
    }
    
    // Create new array with a new object for the modified item to ensure state update.
    const updatedEvents = [...events];
    const eventToUpdate = updatedEvents[eventIndex];
    updatedEvents[eventIndex] = { ...eventToUpdate, isDeleted: false };

    persistEvents(updatedEvents);
    return { success: true, message: 'Evento restaurado com sucesso.' };
  };
  
  const permanentlyDeleteEvent = (eventId: number): { success: boolean, message: string } => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    persistEvents(updatedEvents);
    return { success: true, message: 'Evento excluído permanentemente.' };
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    persistUsers(updatedUsers);
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const updatePassword = (userId: string, oldPass: string, newPass: string): { success: boolean, message: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: "Usuário não encontrado." };
    }
    if (user.password !== oldPass) {
      return { success: false, message: "A senha atual está incorreta." };
    }
    if (newPass.length < 6) {
        return { success: false, message: "A nova senha deve ter pelo menos 6 caracteres." };
    }
  
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password: newPass } : u);
    persistUsers(updatedUsers);
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
    }
  
    return { success: true, message: "Senha atualizada com sucesso!" };
  };
  
  const deleteUser = (userId: string): { success: boolean, message: string } => {
    const updatedUsers = users.filter(u => u.id !== userId);
    persistUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
        logout();
    }
    return { success: true, message: "Conta deletada com sucesso." };
  }

  const addPixKey = (userId: string, key: PixKey): { success: boolean, message: string } => {
    const userExists = users.some(u => u.pixKeys?.some(k => k.key === key.key && !k.isDeleted));
    if (userExists) {
      return { success: false, message: 'Esta chave Pix já está em uso.' };
    }

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, pixKeys: [...(user.pixKeys || []), key] };
      }
      return user;
    });
    persistUsers(updatedUsers);
    if(currentUser?.id === userId) {
        setCurrentUser(updatedUsers.find(u => u.id === userId) || null);
    }
    return { success: true, message: 'Chave Pix adicionada!' };
  };

  const removePixKey = (userId: string, keyToRemove: string): { success: boolean, message: string } => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'Usuário não encontrado.' };
    }

    const user = users[userIndex];
    const keyIndex = user.pixKeys?.findIndex(k => k.key === keyToRemove) ?? -1;
    if (keyIndex === -1) {
        return { success: false, message: 'Chave PIX não encontrada.' };
    }
    
    // Explicitly create new arrays and objects to guarantee state update
    const updatedUserPixKeys = [...(user.pixKeys || [])];
    updatedUserPixKeys[keyIndex] = { ...updatedUserPixKeys[keyIndex], isDeleted: true };
    
    const updatedUser = { ...user, pixKeys: updatedUserPixKeys };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    persistUsers(updatedUsers);
    
    if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
    }
    return { success: true, message: 'Chave Pix movida para a lixeira.' };
  };

  const restorePixKey = (userId: string, keyToRestore: string): { success: boolean; message: string; } => {
    const keyIsActiveSomewhereElse = users.some(u => u.id !== userId && u.pixKeys?.some(k => k.key === keyToRestore && !k.isDeleted));
    if (keyIsActiveSomewhereElse) {
        return { success: false, message: 'Não é possível restaurar. A chave já está ativa em outra conta.' };
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'Usuário não encontrado.' };
    }

    const user = users[userIndex];
    const keyIndex = user.pixKeys?.findIndex(k => k.key === keyToRestore) ?? -1;
    if (keyIndex === -1) {
        return { success: false, message: 'Chave PIX não encontrada.' };
    }

    const updatedUserPixKeys = [...(user.pixKeys || [])];
    updatedUserPixKeys[keyIndex] = { ...updatedUserPixKeys[keyIndex], isDeleted: false };

    const updatedUser = { ...user, pixKeys: updatedUserPixKeys };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    persistUsers(updatedUsers);

    if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
    }
    return { success: true, message: 'Chave Pix restaurada.' };
  };

  const permanentlyRemovePixKey = (userId: string, keyToRemove: string): { success: boolean; message: string; } => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, pixKeys: (user.pixKeys || []).filter(k => k.key !== keyToRemove) };
      }
      return user;
    });
    persistUsers(updatedUsers);
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUsers.find(u => u.id === userId) || null);
    }
    return { success: true, message: 'Chave Pix removida permanentemente.' };
  };

  const sendDollars = (senderId: string, receiverKey: string, amount: number): { success: boolean, message: string } => {
    if (amount <= 0) return { success: false, message: "A quantia deve ser positiva." };

    const sender = users.find(u => u.id === senderId);
    if (!sender) return { success: false, message: "Remetente não encontrado." };

    const receiver = users.find(u => 
        u.pixKeys?.some(k => k.key.toLowerCase() === receiverKey.toLowerCase() && !k.isDeleted) ||
        u.qrCodeValue.toLowerCase() === receiverKey.toLowerCase()
    );
    if (!receiver) return { success: false, message: "Destinatário com essa chave Pix não foi encontrado." };
    if (receiver.id === sender.id) return { success: false, message: "Você não pode enviar dólares para si mesmo." };

    if (sender.role === Role.Pathfinder && (sender.dollars || 0) < amount) {
      return { success: false, message: "Saldo insuficiente." };
    }

    const transactionId = `txn_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const senderTransaction: Transaction = {
      id: transactionId, type: TransactionType.Sent, amount, senderId, receiverId: receiver.id,
      senderName: sender.fullName, receiverName: receiver.fullName, timestamp, pixKeyUsed: receiverKey,
    };
    const receiverTransaction: Transaction = {
      id: transactionId, type: TransactionType.Received, amount, senderId, receiverId: receiver.id,
      senderName: sender.fullName, receiverName: receiver.fullName, timestamp, pixKeyUsed: receiverKey,
    };

    const updatedUsers = users.map(user => {
      if (user.id === sender.id) {
        const newDollars = (user.role === Role.Instructor) ? user.dollars : (user.dollars || 0) - amount;
        return { ...user, dollars: newDollars, transactions: [senderTransaction, ...(user.transactions || [])] };
      }
      if (user.id === receiver.id) {
        return { ...user, dollars: (user.dollars || 0) + amount, transactions: [receiverTransaction, ...(user.transactions || [])] };
      }
      return user;
    });

    persistUsers(updatedUsers);
    if (currentUser?.id === sender.id) {
      setCurrentUser(updatedUsers.find(u => u.id === sender.id) || null);
    }

    return { success: true, message: "Transferência bem-sucedida!" };
  };

  const addTaskToAllPathfinders = (taskDetails: Omit<Task, 'id' | 'completed' | 'isDeleted'>): { success: boolean; message: string; } => {
    // FIX: Check for duplicates in the global tasks list, not per-user, to ensure data consistency.
    if (tasks.some(t => t.title === taskDetails.title && !t.isDeleted)) {
        return { success: false, message: 'Já existe uma tarefa ativa com este título.' };
    }

    const newTaskId = Date.now();
    const newTaskTemplate: Task = {
        ...taskDetails,
        id: newTaskId,
        completed: false,
        isDeleted: false,
        dueDate: taskDetails.dueDate || undefined,
    };

    const newGlobalTasks = [...tasks, newTaskTemplate];
    persistTasks(newGlobalTasks);

    const updatedUsers = users.map(user => {
        if (user.role === Role.Pathfinder) {
            // Add the new task to every pathfinder's list.
            return {
                ...user,
                tasks: [...(user.tasks || []), { ...newTaskTemplate }]
            };
        }
        return user;
    });
    persistUsers(updatedUsers);

    return { success: true, message: "Tarefa adicionada a todos os desbravadores!" };
  };
  
  const updateTask = (updatedTask: Task): { success: boolean; message: string; } => {
      // FIX: Add a check to prevent renaming a task to a title that's already in use by another active task.
      if (tasks.some(t => t.id !== updatedTask.id && t.title === updatedTask.title && !t.isDeleted)) {
          return { success: false, message: "Já existe outra tarefa ativa com este título." };
      }

      const newTasksList = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      persistTasks(newTasksList);

      const updatedUsers = users.map(user => {
          if (user.role === Role.Pathfinder && user.tasks) {
              const taskIndex = user.tasks.findIndex(t => t.id === updatedTask.id);
              if (taskIndex > -1) {
                  const newTasks = [...user.tasks];
                  const oldUserTask = newTasks[taskIndex];
                  // FIX: Ensure user-specific data is preserved while robustly updating with global task data.
                  // This correctly propagates the isDeleted status from the global task update.
                  newTasks[taskIndex] = {
                      ...oldUserTask, // This preserves user's completion status & submission
                      title: updatedTask.title,
                      description: updatedTask.description,
                      dollarReward: updatedTask.dollarReward,
                      dueDate: updatedTask.dueDate,
                      isDeleted: updatedTask.isDeleted,
                  };
                  return { ...user, tasks: newTasks };
              }
          }
          return user;
      });
      persistUsers(updatedUsers);

      return { success: true, message: "Tarefa atualizada com sucesso!" };
  };

  const deleteTask = (taskId: number): { success: boolean; message: string; } => {
    const taskExists = tasks.some(t => t.id === taskId);
    if (!taskExists) {
        return { success: false, message: "Tarefa não encontrada." };
    }

    const updatedGlobalTasks = tasks.map(task =>
        task.id === taskId ? { ...task, isDeleted: true } : task
    );
    persistTasks(updatedGlobalTasks);

    const updatedUsers = users.map(user => {
        if (user.role === Role.Pathfinder && user.tasks?.some(t => t.id === taskId)) {
            const updatedUserTasks = user.tasks.map(task =>
                task.id === taskId ? { ...task, isDeleted: true } : task
            );
            return { ...user, tasks: updatedUserTasks };
        }
        return user;
    });
    persistUsers(updatedUsers);

    return { success: true, message: "Tarefa movida para a lixeira." };
  };
  
  const restoreTask = (taskId: number): { success: boolean; message: string; } => {
    const taskExists = tasks.some(t => t.id === taskId);
    if (!taskExists) {
        return { success: false, message: "Tarefa não encontrada." };
    }
    
    const updatedGlobalTasks = tasks.map(task =>
        task.id === taskId ? { ...task, isDeleted: false } : task
    );
    persistTasks(updatedGlobalTasks);

    const updatedUsers = users.map(user => {
        if (user.role === Role.Pathfinder && user.tasks?.some(t => t.id === taskId)) {
            const updatedUserTasks = user.tasks.map(task =>
                task.id === taskId ? { ...task, isDeleted: false } : task
            );
            return { ...user, tasks: updatedUserTasks };
        }
        return user;
    });
    persistUsers(updatedUsers);
  
    return { success: true, message: "Tarefa restaurada com sucesso." };
  };
  
  const permanentlyDeleteTask = (taskId: number): { success: boolean; message: string; } => {
      const newTasksList = tasks.filter(t => t.id !== taskId);
      persistTasks(newTasksList);
  
      const updatedUsers = users.map(user => {
          if (user.role === Role.Pathfinder && user.tasks) {
              const newTasks = user.tasks.filter(t => t.id !== taskId);
              return { ...user, tasks: newTasks };
          }
          return user;
      });
      persistUsers(updatedUsers);
  
      return { success: true, message: "Tarefa deletada permanentemente." };
  };

  const completeUserTask = (userId: string, taskId: number, submission: { message: string; imageUrl?: string }): { success: boolean; message: string; } => {
    const user = users.find(u => u.id === userId);
    const task = user?.tasks?.find(t => t.id === taskId);

    if (!user || !task) {
      return { success: false, message: "Tarefa ou usuário não encontrado." };
    }

    if (task.completed) {
      return { success: false, message: "Esta tarefa já foi concluída." };
    }

    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newDollars = (u.dollars || 0) + task.dollarReward;
        const updatedTasks = u.tasks?.map(t => 
          t.id === taskId ? { ...t, completed: true, submission: { ...submission, timestamp: new Date().toISOString() } } : t
        );
        return { ...u, dollars: newDollars, tasks: updatedTasks };
      }
      return u;
    });

    persistUsers(updatedUsers);
    if (currentUser?.id === userId) {
        setCurrentUser(updatedUsers.find(u => u.id === userId) || null);
    }
    return { success: true, message: `Tarefa enviada com sucesso! +${task.dollarReward} dólares foram adicionados à sua conta.` };
  };

  const rejectUserTask = (userId: string, taskId: number): { success: boolean; message: string; } => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: "Usuário não encontrado." };
    }

    const user = users[userIndex];
    const taskIndex = user.tasks?.findIndex(t => t.id === taskId);

    if (!user.tasks || typeof taskIndex === 'undefined' || taskIndex === -1) {
        return { success: false, message: "Tarefa não encontrada para este usuário." };
    }
    
    const task = user.tasks[taskIndex];

    if (!task.completed) {
        return { success: false, message: "Esta tarefa não está marcada como concluída." };
    }

    const newDollars = (user.dollars || 0) - task.dollarReward;
    
    const updatedTasks = [...user.tasks];
    updatedTasks[taskIndex] = {
        ...task,
        completed: false,
        submission: undefined // Remove submission details
    };
    
    const updatedUser = {
        ...user,
        dollars: newDollars < 0 ? 0 : newDollars, // Ensure dollars don't go negative
        tasks: updatedTasks
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    persistUsers(updatedUsers);
    
    return { success: true, message: `Tarefa revertida! ${task.dollarReward} dólares foram deduzidos de ${user.fullName}.` };
  };

  const adjustPathfinderProgress = (userId: string, adjustmentAmount: number): { success: boolean, message: string } => {
    const userIndex = users.findIndex(u => u.id === userId && u.role === Role.Pathfinder);
    if (userIndex === -1) {
        return { success: false, message: "Desbravador não encontrado." };
    }

    const user = users[userIndex];
    if (!user.classProgress) {
        return { success: false, message: "Este desbravador não possui dados de progresso." };
    }

    const currentSignatures = user.classProgress.signatures;
    const newSignatures = currentSignatures + adjustmentAmount;

    if (newSignatures < 0) {
         return { success: false, message: "O progresso não pode ser negativo." };
    }

    const updatedUser = {
        ...user,
        classProgress: {
            ...user.classProgress,
            signatures: newSignatures
        }
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    persistUsers(updatedUsers);

    return { success: true, message: `Progresso de ${user.fullName} ajustado com sucesso.` };
  };

  const addVisit = (visitDetails: Omit<Visit, 'id'>): { success: boolean, message: string } => {
    const newVisit: Visit = {
      ...visitDetails,
      id: `visit_${Date.now()}`
    };
    const updatedVisits = [newVisit, ...visits];
    persistVisits(updatedVisits);
    return { success: true, message: 'Visita registrada com sucesso!' };
  };

  const addAchievement = (userId: string, achievement: string): { success: boolean, message: string } => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: "Usuário não encontrado." };
    }
    
    const user = users[userIndex];
    const achievements = user.achievements || [];
    
    if (achievements.map(a => a.toLowerCase()).includes(achievement.toLowerCase())) {
        return { success: false, message: "Esta conquista já existe." };
    }
    
    const updatedUser = { ...user, achievements: [...achievements, achievement] };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    persistUsers(updatedUsers);
    
    return { success: true, message: "Conquista adicionada com sucesso!" };
  };

  const removeAchievement = (userId: string, achievementIndex: number): { success: boolean, message: string } => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: "Usuário não encontrado." };
    }
    
    const user = users[userIndex];
    const achievements = user.achievements || [];
    
    if (achievementIndex < 0 || achievementIndex >= achievements.length) {
        return { success: false, message: "Conquista não encontrada." };
    }
    
    const updatedAchievements = achievements.filter((_, index) => index !== achievementIndex);
    const updatedUser = { ...user, achievements: updatedAchievements };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    persistUsers(updatedUsers);
    
    return { success: true, message: "Conquista removida com sucesso!" };
  };


  const value = {
    currentUser,
    setCurrentUser,
    users,
    registerUser,
    login,
    logout,
    updateUser,
    updatePassword,
    deleteUser,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    restoreEvent,
    permanentlyDeleteEvent,
    addPixKey,
    removePixKey,
    restorePixKey,
    permanentlyRemovePixKey,
    sendDollars,
    isInitialized,
    tasks,
    addTaskToAllPathfinders,
    updateTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    completeUserTask,
    rejectUserTask,
    adjustPathfinderProgress,
    visits,
    addVisit,
    addAchievement,
    removeAchievement,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};