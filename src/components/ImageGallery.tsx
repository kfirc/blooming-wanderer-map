
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  isDetailed: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, isDetailed }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedImage(index);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="px-4 pb-4">
        {images.length === 1 ? (
          <div 
            className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openModal(0)}
          >
            <img 
              src={images[0]} 
              alt="Flower bloom"
              className="w-full h-full object-cover"
            />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div 
                key={index}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openModal(index)}
              >
                <img 
                  src={image} 
                  alt={`Flower bloom ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openModal(0)}
            >
              <img 
                src={images[0]} 
                alt="Flower bloom 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              <div 
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openModal(1)}
              >
                <img 
                  src={images[1]} 
                  alt="Flower bloom 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
                onClick={() => openModal(2)}
              >
                <img 
                  src={images[2]} 
                  alt="Flower bloom 3"
                  className="w-full h-full object-cover"
                />
                {images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{images.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <img 
              src={images[currentImageIndex]} 
              alt={`Flower bloom ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
