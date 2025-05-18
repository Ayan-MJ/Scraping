"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { 
  Bell, Check, ChevronsUpDown, CreditCard, Download, 
  Laptop, LogOut, Moon, Settings, Sun, User 
} from "lucide-react"

export default function UiIndexPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">UI Component Library</h1>
        <p className="text-lg text-muted-foreground">
          This page showcases the UI components used throughout the application.
        </p>
      </div>

      <Tabs defaultValue="buttons" className="mb-12">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Form Elements</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="other">Other Components</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons" className="py-6">
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg">Large</Button>
                <Button>Default</Button>
                <Button size="sm">Small</Button>
                <Button size="icon"><Settings className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Button States</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button className="bg-brand-green hover:bg-brand-green-dark">Brand</Button>
                <Button className="bg-brand-green hover:bg-brand-green-dark">
                  <Download className="mr-2 h-4 w-4" /> With Icon
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="py-6">
          <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Enter your password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              
              <Button className="mt-4">Submit</Button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <Label>Select Option</Label>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-4">
                <Label>Slider Example</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
              
              <div className="space-y-4">
                <Label>Toggle Switch</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Calendar</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="py-6">
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Configure your scraping project settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input placeholder="My Project" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Enable Email Notifications</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Badge>New</Badge>
                </div>
                <CardDescription>Your recent scraping activities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">E-commerce Scraper</p>
                      <p className="text-xs text-muted-foreground">Run completed • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/02.png" alt="Avatar" />
                      <AvatarFallback>NS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">News Scraper</p>
                      <p className="text-xs text-muted-foreground">Run failed • Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="py-6">
          <h2 className="text-2xl font-bold mb-6">Other Components</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-brand-green text-white">Brand</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Avatars</h3>
              <div className="flex flex-wrap gap-4">
                <Avatar>
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="/avatars/02.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Theme Icons</h3>
              <div className="flex flex-wrap gap-6">
                <Sun className="h-6 w-6" />
                <Moon className="h-6 w-6" />
                <Laptop className="h-6 w-6" />
                <Settings className="h-6 w-6" />
                <Bell className="h-6 w-6" />
                <User className="h-6 w-6" />
                <CreditCard className="h-6 w-6" />
                <Check className="h-6 w-6" />
                <ChevronsUpDown className="h-6 w-6" />
                <LogOut className="h-6 w-6" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 