
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileImageUploadProps {
  currentImage: string;
  userName: string;
  onImageSave: (imageData: string) => void;
}

export const ProfileImageUpload = ({ currentImage, userName, onImageSave }: ProfileImageUploadProps) => {
  const [previewImage, setPreviewImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.includes('image/')) {
        alert("Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG)!");
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = () => {
    onImageSave(previewImage);
    setIsEditing(false);
    setPreviewImage("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="w-32 h-32 mx-auto cursor-pointer" onClick={handleImageClick}>
              <AvatarImage 
                src={isEditing ? previewImage : currentImage} 
                alt={userName}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {!isEditing ? (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleImageClick}>
                <Camera className="w-4 h-4 mr-2" />
                {currentImage ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              {currentImage && (
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => onImageSave("")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover Foto
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-blue-600 font-medium">
                Nova foto selecionada - clique em salvar para confirmar
              </p>
              <div className="flex space-x-2 justify-center">
                <Button onClick={handleSaveImage} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Foto
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>Formatos aceitos: PNG, JPG, JPEG</p>
            <p>Tamanho máximo: 5MB</p>
            <p>Recomendado: foto quadrada para melhor resultado</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
