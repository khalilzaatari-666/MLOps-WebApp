import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewModel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Model Creation</h1>
        <p className="text-gray-500">Create new machine learning models</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Model Creation</CardTitle>
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

export default NewModel;
