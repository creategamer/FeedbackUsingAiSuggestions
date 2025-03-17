'use client'
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Message } from '@/model/User';
import { useToast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const { toast } = useToast()

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
            toast({
                title: response.data.message,
            });
            onMessageDelete(message._id)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message || 'Failed to delete message',
                variant: 'destructive',
            });
        }
    }

    return (
        <Card className="relative group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] max-w-2xl w-full mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {message.content}
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant={'destructive'} 
                                size={'sm'}
                                className="rounded-full p-2 h-8 w-8 hover:scale-110 transition-transform"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-lg max-w-[90%]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-800 dark:text-gray-200">
                                    Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                    This action will permanently delete this message. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {message.createdAt && (
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleDateString()}
                    </CardDescription>
                )}
            </CardHeader>
            
            {/* Additional Content Section */}
            <CardContent className="pt-2 pb-4">
                {message.additionalInfo && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {message.additionalInfo}
                    </p>
                )}
            </CardContent>

            {/* Footer Section */}
            <CardFooter className="border-t pt-3">
                <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>From: {message.sender}</span>
                    <span>•</span>
                    <span>Type: Feedback</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export default MessageCard