"use client";

import { useState, useEffect } from "react";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/presentation/components/ui/card";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/presentation/hooks/use-toast";
import OptimizeImage from "../shared/OptimizeImage";
const AdminTemplateUpload = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [fetchingTemplates, setFetchingTemplates] = useState(false);
    const { toast } = useToast();
    const API_BASE = "";
    // Fetch templates
    const fetchTemplates = async () => {
        setFetchingTemplates(true);
        try {
            const res = await fetch(`${API_BASE}/admin/templates`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            });
            if (res.ok) {
                setTemplates(await res.json());
            }
        }
        finally {
            setFetchingTemplates(false);
        }
    };
    useEffect(() => {
        fetchTemplates();
    }, []);
    // File select
    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        const validFiles = selected.filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024);
        if (validFiles.length !== selected.length) {
            toast({
                title: "Invalid file",
                description: "Only images under 10MB are allowed",
                variant: "destructive",
            });
        }
        setFiles(validFiles);
    };
    // Upload
    const handleUpload = async () => {
        if (!files.length) {
            toast({
                title: "Error",
                description: "Please select at least one image",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("images", file));
            const res = await fetch(`${API_BASE}/admin/templates/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
                body: formData,
            });
            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Templates uploaded successfully",
                });
                setFiles([]);
                fetchTemplates();
            }
        }
        finally {
            setLoading(false);
        }
    };
    // Delete
    const handleDeleteTemplate = async (id) => {
        if (!confirm("Delete this template?"))
            return;
        await fetch(`${API_BASE}/admin/templates/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
        });
        fetchTemplates();
    };
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Templates</CardTitle>
          <CardDescription>Upload multiple template images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={loading}/>

          <Button onClick={handleUpload} disabled={!files.length || loading} className="w-full">
            {loading ? (<>
                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                Uploading...
              </>) : (<>
                <Upload className="w-4 h-4 mr-2"/>
                Upload {files.length} Image(s)
              </>)}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingTemplates ? (<Loader2 className="animate-spin"/>) : (<div className="grid grid-cols-3 gap-4">
              {templates.map((t) => (<div key={t.id} className="border rounded">
                  <OptimizeImage publicId={t.cloudinaryPublicId} className="h-40 w-full object-cover"/>
                  <div className="p-2">
                    <p className="text-sm mb-2">{t.name}</p>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(t.id)} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2"/>
                      Delete
                    </Button>
                  </div>
                </div>))}
            </div>)}
        </CardContent>
      </Card>
    </div>);
};
export default AdminTemplateUpload;
