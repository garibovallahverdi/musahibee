"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { api } from "~/trpc/react";
import Loading from "./loading";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { CiImageOn } from "react-icons/ci";


interface ArticleData {
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  galleryImages: string[];
  imagesUrl: string[];
  multimedia: boolean;
}

function NewsEditor() {

      const [isMultimedia, setIsMultimedia] = useState<boolean>(false);
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [videoLink, setVideoLink] = useState("");
    
    const params = useParams();
    const slug = params.slug as string; 

    const createArticleMutation = api.editor.article.create.useMutation();
    const updateArticleMutation = api.editor.article.update.useMutation();
    const uploadFileMutation = api.editor.storage.uploadFile.useMutation();
    const deleteFileMutation = api.editor.storage.deleteFile.useMutation();

      const [galleryImages, setGalleryImages] = useState<string[]>([]);
      // Düzenleme sırasında silinmek üzere işaretlenen galeri görselleri
      const [galleryImagesToDelete, setGalleryImagesToDelete] = useState<string[]>([]);
    
      // Yükleme durumları ve bileşen montajı için state'ler
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(false);


      
        const {
          data: articleToEdit,
          isLoading: isArticleLoading,
          isError: articleFetchError,
        } = api.editor.article.getById.useQuery({ slug }, { enabled: !!slug }); // Slug varsa makaleyi getir
      


  // --- Galeri Görseli Yönetimi ---
  const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    setIsGalleryLoading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(file);
        const base64Image = await base64Promise;

        const result = await uploadFileMutation.mutateAsync({
          base64File: base64Image,
          fileName: file.name,
          fileType: file.type,
          folder: "gallery",
        });
        uploadedUrls.push(result.url);
        toast.success(`'${file.name}' galeriye başarıyla yüklendi.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(`Galeri görseli yüklenirken hata oluştu: ${file.name}`, error);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        toast.error(`'${file.name}' yüklenemedi: ${error.message}`);
      }
    }
    // Yeni yüklenen URL'leri mevcut galeri görselleri state'ine ekle
    
    setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    setIsGalleryLoading(false);
    event.target.value = ""; // Input'u temizle

    console.log(galleryImages, "galery images upload");
    
  };

  const handleDeleteGalleryImage = (imageUrl: string) => {
    if (slug && articleToEdit) {
      // Düzenleme modundaysa, silinmek üzere işaretle ancak hemen depolamadan silme
      setGalleryImagesToDelete((prev) => [...prev, imageUrl]);
      // Arayüzü güncellemek için galleryImages state'inden hemen kaldır
      setGalleryImages((prev) => prev.filter((url) => url !== imageUrl));
      toast.info("Galeri görseli makale güncellendiğinde silinmek üzere işaretlendi.");
    } else {
      // Yeni makale oluşturma modundaysa, henüz kaydedilmediği için hemen sil
      setIsLoading(true);
      deleteFileMutation.mutateAsync({ fileUrl: imageUrl })
        .then(() => {
          setGalleryImages((prev) => prev.filter((url) => url !== imageUrl));
          toast.success("Galeri görseli başarıyla silindi.");
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.error("Galeri görseli hemen silinirken hata oluştu:", error);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          toast.error(`Galeri görseli silinirken hata oluştu: ${error.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    console.log(galleryImages, "galery images delete");

  };


  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", "normal", "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          [{ align: [] }],
          ["link", "video"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "script",
    "code-block",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold">Başlık (Title)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Habere başlık yazın..."
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Açıklama (Description)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Kısa açıklama girin..."
          rows={3}
        />
      </div>

      <div>
        <label className="block font-semibold">Kapak Görseli (Zorunlu)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
          required
        />
        {coverImage && (
          <Image
            width={192}
            height={128}
            src={URL.createObjectURL(coverImage)}
            alt="Cover Preview"
            className="mt-2 w-48 h-32 object-cover rounded"
          />
        )}
      </div>

          {/* Multimedia Toggle */}
          <div className="flex items-center gap-2">
            <input
              id="multimedia"
              type="checkbox"
              className="checkbox"
              checked={isMultimedia}
              onChange={(e) => setIsMultimedia(e.target.checked)}
            />
            <label htmlFor="multimedia" className="text-titleText">
              Multimedia İçerik (Multimedia Content)
            </label>
          </div>
  
          {/* Galeri Görseli Bölümü (Multimedia açıksa gösterilir) */}
          {isMultimedia && (
            <div className="flex flex-col gap-3">
              <label className="text-titleText flex items-center gap-2">
                <CiImageOn className="text-xl" /> Galeri Görselleri (Gallery Images)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImageUpload}
                className="file-input file-input-bordered w-full"
                disabled={isGalleryLoading}
              />
              {isGalleryLoading && <div>Galeri görselleri yükleniyor...</div>}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-4">
                  {galleryImages.map((imageUrl) => (
                    <div
                      key={imageUrl}
                      className="group relative aspect-video w-full overflow-hidden rounded-lg shadow-md"
                    >
                      <Image
                        src={imageUrl}
                        alt="Galeri Görseli"
                        className="h-[80px] w-full object-cover"
                        loading="lazy"
                        width={80}
                        height={80}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(imageUrl)}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        title="Görseli Sil"
                        disabled={isLoading}
                      >
                        <MdDeleteForever className="text-xl" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

      <div>
        <label className="block font-semibold">Video Linki (YouTube vs.)</label>
        <input
          type="text"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          placeholder="https://youtube.com/..."
          className="w-full p-2 border rounded"
        />
        {videoLink && (
          <div className="mt-3">
            <iframe
              src={videoLink.replace("watch?v=", "embed/")}
              title="Video preview"
              className="w-full h-64 rounded border"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      <div>
        <label className="block font-semibold">Haber İçeriği</label>
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={setValue}
          className="bg-white"
        />
      </div>

      {/* İstersen burada submit işlemi ekleyebilirsin */}
      {/* <button onClick={handleSubmit}>Kaydet</button> */}
    </div>
  );
}

export default NewsEditor;
