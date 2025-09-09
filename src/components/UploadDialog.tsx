import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { uploadVideo, startProcess } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { t } = useI18n();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [enableMultimodal, setEnableMultimodal] = useState(true);
  const [keepTemp, setKeepTemp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast({ title: t("upload.file.required"), description: t("upload.file.supported"), });
      return;
    }

    try {
      setSubmitting(true);
      const up = await uploadVideo(file);
      toast({ title: t("upload.success"), description: up.message || up.filename });
      await startProcess(up.task_id, { enable_multimodal: enableMultimodal, keep_temp: keepTemp });
      onOpenChange(false);
      nav(`/result/${up.task_id}`);
    } catch (err: any) {
      toast({ title: t("upload.failed"), description: err?.message || t("upload.retry"), });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("upload.dialog.title")}</DialogTitle>
          <DialogDescription>{t("upload.dialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="video">{t("upload.file.label")}</Label>
            <Input id="video" type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="mm">{t("upload.multimodal.label")}</Label>
              <p className="text-xs text-muted-foreground">{t("upload.multimodal.desc")}</p>
            </div>
            <Switch id="mm" checked={enableMultimodal} onCheckedChange={setEnableMultimodal} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="keep">{t("upload.keeptemp.label")}</Label>
              <p className="text-xs text-muted-foreground">{t("upload.keeptemp.desc")}</p>
            </div>
            <Switch id="keep" checked={keepTemp} onCheckedChange={setKeepTemp} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>{t("upload.cancel")}</Button>
            <Button type="submit" disabled={submitting}>{submitting ? t("upload.processing") : t("upload.start")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
