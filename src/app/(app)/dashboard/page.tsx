'use client'

import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
// import { useToast } from '@/hooks/use-toast';
// import { Toast } from '@/components/ui/toast';
import { Message } from '@/model/User'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'

import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { useToast } from "@/hooks/use-toast"

import { LinkIcon, MessageCircle, Inbox, MessageSquare } from 'lucide-react';

function page() {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const { toast } = useToast();

    const handleDeleteMessage = (messageId: string) => {
        // console.log("Deleting message with ID:", messageId);
        // Filter out the message with the matching _id
        setMessages(messages.filter((message) => message._id !== messageId));
    }



    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema),
    });

    const { register, watch, setValue } = form;
    const acceptMessages = watch('acceptMessages');

    //fetching the meesages
    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages')
            // console.log("response the accept Messages:", response);

            setValue('acceptMessages', response.data.isAcceptingMessage)
        } catch (error) {
            const AxiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Error',
                description: 'fetch the latest messages',
                variant: 'destructive',
            });

            // console.log("error on fetching for the accept messages in dashboard the data", error);
        } finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])


    //get messages
    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            // console.log("get messages to the server", response);

            setMessages(response.data.messages || [])
            if (refresh) {
                toast({
                    title: 'success',
                    description: 'Showing latest messages',
                    variant: 'default',
                });
                // console.log("showing latest messagesś");
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            // console.log("dashbord getting the messages errors");
        } finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])

    // Fetch initial state from the server
    useEffect(() => {
        if (!session || !session.user) return
        if (session) {
            fetchAcceptMessage();
        } else {
            console.log('No session found');
        }
        fetchMessages();
        // fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    //handle switch change 
    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', { acceptMessages: !acceptMessages })
            setValue('acceptMessages', !acceptMessages)
            toast({
                title: 'success',
                description: 'messages accept successfully',
                variant: 'default',
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            console.log("error on dashbord in the handle switch part");
        }
    }

    // console.log(session);
    if (!session || !session.user) {
        return <div>Please Login</div>;
    }

    const { username } = session?.user as User

    //TODO:do more researches
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`


    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast({
            title: 'Success',
            description: 'Showing latest messages',
            variant: 'default',
        });
    }

    // if (!session || !session.user) {
    //     return <div>Please Login</div>
    // }


    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-8 bg-white rounded-xl w-full max-w-6xl shadow-xl transition-all duration-300 ease-in-out">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent inline-block">
              Message Dashboard
            </h1>
            <Separator className="mt-4 bg-gradient-to-r from-purple-100 to-blue-100 h-1" />
          </div>
    
          {/* Unique Link Section */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 transition-all hover:border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Your Unique Link</h2>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={profileUrl}
                disabled
                className="flex-1 p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Button 
                onClick={copyToClipboard}
                className="bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-200"
              >
                Copy Link
              </Button>
            </div>
          </div>
    
          {/* Message Acceptance Toggle */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Message Settings</h3>
                <p className="text-sm text-gray-600">Control your message reception</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
                className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-200"
              />
              <span className={`font-medium ${acceptMessages ? 'text-purple-600' : 'text-gray-500'}`}>
                {acceptMessages ? 'Accepting Messages' : 'Not Accepting Messages'}
              </span>
            </div>
          </div>
    
          {/* Refresh Messages Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Inbox className="w-6 h-6 text-purple-600" />
                Your Messages
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} message{messages.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                fetchMessages(true);
              }}
              variant="ghost"
              className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCcw className="h-5 w-5" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
    
          {/* Messages Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <MessageCard
                  key={String(message._id)}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                //   className="hover:shadow-lg transition-shadow duration-200"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mb-4 mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-gray-600 text-lg">No messages yet</h3>
                <p className="text-gray-500 mt-1">Your inbox is ready to receive messages!</p>
              </div>
            )}
          </div>
        </div>
      )
}

export default page
