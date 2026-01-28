import { useState, useRef, useEffect } from "react";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { usePostMutations } from "../hooks/usePostMutations";
import { Button } from "@/shared/components/ui/Button/Button"; 
import { FaImage, FaTimes, FaGlobeAmericas, FaUserFriends, FaLock } from "react-icons/fa";
import { useToast } from "@/shared/contexts/ToastContext";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [privacy, setPrivacy] = useState("public");

  const fileInputRef = useRef(null);
  const user = useAuthStore(authSelectors.user);
  const { createPostMutation } = usePostMutations();
  const toast = useToast();

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 5) {
      toast.error("You can only upload a maximum of 5 images.");
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
        toast.warning("Some files were skipped because they are not images.");
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim() && selectedFiles.length === 0) {
        return; 
    }

    createPostMutation.mutate(
      {
        content: content.trim(),
        images: selectedFiles,
        privacy: privacy,
      },
      {
        onSuccess: () => {
          setContent("");
          setSelectedFiles([]);
          setPreviews([]);
          setPrivacy("public");
        },
      }
    );
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="d-flex mb-3">
            <img
              src={user?.avatar || "https://via.placeholder.com/50"}
              alt="Avatar"
              className="rounded-circle me-3"
              style={{ width: "48px", height: "48px", objectFit: "cover" }}
            />
            <div className="w-100">
              <textarea
                className="form-control border-0 p-0 shadow-none"
                placeholder={`What's on your mind, ${user?.fullName || "friend"}?`}
                rows={3}
                style={{ resize: "none", fontSize: "1.1rem" }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {previews.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {previews.map((src, index) => (
                <div key={src} className="position-relative" style={{ width: "100px", height: "100px" }}>
                  <img
                    src={src}
                    alt="Preview"
                    className="w-100 h-100 rounded object-fit-cover border"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-dark rounded-circle position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center"
                    style={{ width: "20px", height: "20px" }}
                    onClick={() => removeImage(index)}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex gap-3 align-items-center">
              <div 
                className="text-primary cursor-pointer d-flex align-items-center gap-1" 
                style={{ cursor: "pointer" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage size={20} />
                <span className="fw-semibold d-none d-sm-inline">Photo</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                className="d-none"
                onChange={handleFileSelect}
              />

              <div className="dropdown">
                <button 
                    className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center gap-1 rounded-pill px-3" 
                    type="button"
                    data-bs-toggle="dropdown"
                >
                    {privacy === 'public' && <><FaGlobeAmericas size={12}/> Public</>}
                    {privacy === 'friends' && <><FaUserFriends size={12}/> Friends</>}
                    {privacy === 'private' && <><FaLock size={12}/> Only Me</>}
                </button>
                <ul className="dropdown-menu shadow-sm border-0">
                    <li><button className="dropdown-item" type="button" onClick={() => setPrivacy('public')}>Public</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setPrivacy('friends')}>Friends</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setPrivacy('private')}>Only Me</button></li>
                </ul>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="yellow" 
              className="px-4 py-2"
              isLoading={createPostMutation.isPending}
              disabled={!content.trim() && selectedFiles.length === 0}
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;