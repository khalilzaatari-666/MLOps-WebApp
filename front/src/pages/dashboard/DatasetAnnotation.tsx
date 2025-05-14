import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DatasetAnnotation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dataset Annotation</h1>
        <p className="text-gray-500">Annotate your datasets for training purposes</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dataset Annotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-60">
            <p className="text-gray-500">This feature will be implemented in the next phase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetAnnotation;
