import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";

// Tipo do agendamento
export interface AppointmentType {
  id: number;
  patientName: string;
  date: string;
  time: string;
  type: string;
  attendanceType: "presencial" | "remoto";
  patientEmail: string;
  notes?: string;
  status: "pendente" | "confirmada" | "cancelada";
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (appointment: AppointmentType) => void;
}

export function CreateAppointmentModal({ isOpen, onClose, onCreate }: CreateAppointmentModalProps) {
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [attendanceType, setAttendanceType] = useState<"presencial" | "remoto">("presencial");
  const [patientEmail, setPatientEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = () => {
    // Validar se a data não é no passado
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert("Não é possível criar agendamentos para datas passadas!");
      return;
    }
    
    const newAppointment: AppointmentType = {
      id: Date.now(),
      patientName,
      date,
      time,
      type,
      attendanceType,
      patientEmail,
      notes,
      status: "pendente",
    };
    onCreate(newAppointment);
    // Resetar campos
    setPatientName("");
    setDate("");
    setTime("");
    setType("");
    setAttendanceType("presencial");
    setPatientEmail("");
    setNotes("");
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 flex items-center justify-center" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-30"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-30"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-200"
          enterFrom="scale-95"
          enterTo="scale-100"
          leave="transition-transform duration-200"
          leaveFrom="scale-100"
          leaveTo="scale-95"
        >
          <div className="bg-white p-6 rounded-lg z-10 w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">Criar Novo Agendamento</Dialog.Title>

            <div className="space-y-2">
              <input
                className="w-full border p-2 rounded"
                placeholder="Nome do paciente"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                className="w-full border p-2 rounded"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Tipo de consulta"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <select
                className="w-full border p-2 rounded"
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value as "presencial" | "remoto")}
              >
                <option value="presencial">Presencial</option>
                <option value="remoto">Online</option>
              </select>
              <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Email do paciente"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Observações"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={onClose} variant="outline">Cancelar</Button>
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
