import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, Upload, Loader2, CheckCircle, Play, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroVideoUploadProps {
  cleanerId?: string;
  currentVideoUrl?: string | null;
}

const MAX_DURATION_SECONDS = 120; // 2 minutes
const MAX_FILE_MB = 100;

export function IntroVideoUpload({ cleanerId, currentVideoUrl }: IntroVideoUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentVideoUrl || null);
  const [duration, setDuration] = useState<number | null>(null);
  const [durationError, setDurationError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/intro-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      // Save URL to cleaner_profiles
      if (cleanerId) {
        await supabase
          .from("cleaner_profiles")
          .update({ intro_video_url: publicUrl } as any)
          .eq("id", cleanerId);
      }

      return publicUrl;
    },
    onSuccess: (url) => {
      setPreviewUrl(url);
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });
      toast({ title: "Intro video uploaded ✓", description: "Clients can now watch your intro before booking." });
    },
    onError: (e: any) => {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
      setPreviewUrl(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("video/")) {
      toast({ title: "Not a video", description: "Please upload an MP4, MOV, or WebM file.", variant: "destructive" });
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Keep it under ${MAX_FILE_MB}MB.`, variant: "destructive" });
      return;
    }

    // Check duration via a temporary video element
    const tempVideo = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration;
      URL.revokeObjectURL(objectUrl);
      if (dur > MAX_DURATION_SECONDS) {
        setDurationError(true);
        toast({
          title: "Video too long",
          description: `Your video is ${Math.round(dur)}s. Please keep it under 2 minutes.`,
          variant: "destructive",
        });
        return;
      }
      setDurationError(false);
      setDuration(Math.round(dur));
      const previewObjectUrl = URL.createObjectURL(file);
      setPreviewUrl(previewObjectUrl);
      uploadMutation.mutate(file);
    };
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setDuration(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card
      style={{
        border: "2px solid hsl(var(--primary) / 0.4)",
        boxShadow: "0 4px 24px 0 hsl(var(--primary) / 0.12)",
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-5 w-5 text-primary" />
          Intro Video
          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs ml-1">Boosts bookings</Badge>
        </CardTitle>
        <CardDescription>
          A short 1–2 minute video introducing yourself dramatically increases client confidence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Tips */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-primary" /> What to say in your intro video:
          </p>
          {[
            "Introduce yourself by first name and how long you've been cleaning",
            "Mention 1–2 things you take extra pride in (e.g. kitchens, organization)",
            "Tell clients what they can expect when booking you",
            "Smile and speak naturally — authenticity builds trust!",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              {tip}
            </div>
          ))}
        </div>

        {/* Upload zone / preview */}
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: "16/9" }}
            >
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
                playsInline
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="h-14 w-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  {isPlaying
                    ? <span className="text-white text-xl font-bold">⏸</span>
                    : <Play className="h-7 w-7 text-white ml-1" />}
                </button>
              </div>

              {/* Duration + remove badges */}
              <div className="absolute top-3 right-3 flex gap-2">
                {duration && (
                  <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
                  </Badge>
                )}
                <button
                  onClick={handleRemove}
                  className="h-7 w-7 rounded-full bg-black/60 hover:bg-destructive/80 flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Uploading spinner */}
              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                  <p className="text-white text-sm font-medium">Uploading…</p>
                </div>
              )}

              {/* Success badge */}
              {uploadMutation.isSuccess && !uploadMutation.isPending && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-success/90 text-white border-0 gap-1 backdrop-blur-sm">
                    <CheckCircle className="h-3.5 w-3.5" /> Uploaded
                  </Badge>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 transition-all
                ${durationError
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5"}`}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Tap to upload your intro video</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM · max 2 min · up to 100MB</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                <Upload className="h-4 w-4" /> Choose Video
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/mov,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFile}
        />

        {previewUrl && !uploadMutation.isPending && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Replace Video
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
