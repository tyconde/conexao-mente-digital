import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    professionalId: number;
    professionalName: string;
    date: string;
    time: string;
  };
  patientId: number;
  patientName: string;
}

export const ReviewModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  patientId, 
  patientName 
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const { addReview } = useReviews();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }

    const success = addReview({
      patientId,
      patientName,
      professionalId: appointment.professionalId,
      professionalName: appointment.professionalName,
      appointmentId: appointment.id,
      rating,
      comment: comment.trim() || undefined
    });

    if (success) {
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por avaliar o profissional."
      });
      
      // Dispara evento para atualizar a lista de psicólogos
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'reviews',
        newValue: localStorage.getItem('reviews')
      }));
      
      handleClose();
    } else {
      toast({
        title: "Erro",
        description: "Você já avaliou esta consulta.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Consulta</DialogTitle>
          <DialogDescription>
            Como foi sua experiência com {appointment.professionalName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da consulta */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Profissional:</strong> {appointment.professionalName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
            </p>
          </div>

          {/* Sistema de estrelas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nota da Consulta *</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && "Clique nas estrelas para avaliar"}
              {rating === 1 && "Péssimo"}
              {rating === 2 && "Ruim"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bom"}
              {rating === 5 && "Excelente"}
            </p>
          </div>

          {/* Comentário opcional */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentário (opcional)
            </label>
            <Textarea
              placeholder="Compartilhe sua experiência com a consulta..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 caracteres
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Enviar Avaliação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
