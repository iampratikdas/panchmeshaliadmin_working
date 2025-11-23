import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, createEvent } from '../lib/api';
import type { CreateEventData } from '../types/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Calendar, Users, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Events() {
    const [showForm, setShowForm] = useState(false);
    const [hasSibling, setHasSibling] = useState(false);
    const [teamMemberInput, setTeamMemberInput] = useState('');
    const [teamMembers, setTeamMembers] = useState<string[]>([]);

    const [formData, setFormData] = useState<Omit<CreateEventData, 'teamMembers' | 'hasSiblingEvent'>>({
        name: '',
        duration: 0,
        timePeriod: { startDate: '', endDate: '' },
        siblingEventName: '',
        siblingTimePeriod: { startDate: '', endDate: '' },
        resultsReleased: false,
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: fetchEvents,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEventData) => createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: 'Success!', description: 'Event created successfully.' });
            setShowForm(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            duration: 0,
            timePeriod: { startDate: '', endDate: '' },
            siblingEventName: '',
            siblingTimePeriod: { startDate: '', endDate: '' },
            resultsReleased: false,
        });
        setTeamMembers([]);
        setHasSibling(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            teamMembers,
            hasSiblingEvent: hasSibling,
        });
    };

    const addTeamMember = () => {
        if (teamMemberInput.trim() && !teamMembers.includes(teamMemberInput.trim())) {
            setTeamMembers([...teamMembers, teamMemberInput.trim()]);
            setTeamMemberInput('');
        }
    };

    const removeTeamMember = (member: string) => {
        setTeamMembers(teamMembers.filter(m => m !== member));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Events Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Create and manage writing events
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="h-12 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Cancel' : 'Create Event'}
                </Button>
            </div>

            {/* Create Event Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Event</CardTitle>
                        <CardDescription>Fill in the event details below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Event Name */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Event Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Poetry Writing Contest 2025"
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Duration (days)</label>
                                <Input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.duration || ''}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                    placeholder="30"
                                />
                            </div>

                            {/* Time Period */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.timePeriod.startDate}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            timePeriod: { ...formData.timePeriod, startDate: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">End Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.timePeriod.endDate}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            timePeriod: { ...formData.timePeriod, endDate: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            {/* Sibling Event Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasSibling"
                                    checked={hasSibling}
                                    onChange={(e) => setHasSibling(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="hasSibling" className="text-sm font-medium">
                                    Has Sibling Event
                                </label>
                            </div>

                            {/* Sibling Event Fields */}
                            {hasSibling && (
                                <div className="pl-6 border-l-2 border-primary/20 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Sibling Event Name</label>
                                        <Input
                                            value={formData.siblingEventName}
                                            onChange={(e) => setFormData({ ...formData, siblingEventName: e.target.value })}
                                            placeholder="e.g., Short Story Contest 2025"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Sibling Start Date</label>
                                            <Input
                                                type="date"
                                                value={formData.siblingTimePeriod?.startDate || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    siblingTimePeriod: {
                                                        startDate: e.target.value,
                                                        endDate: formData.siblingTimePeriod?.endDate || ''
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Sibling End Date</label>
                                            <Input
                                                type="date"
                                                value={formData.siblingTimePeriod?.endDate || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    siblingTimePeriod: {
                                                        startDate: formData.siblingTimePeriod?.startDate || '',
                                                        endDate: e.target.value
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Results Released */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="resultsReleased"
                                    checked={formData.resultsReleased}
                                    onChange={(e) => setFormData({ ...formData, resultsReleased: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="resultsReleased" className="text-sm font-medium">
                                    Results Released
                                </label>
                            </div>

                            {/* Team Members */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Team Members</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={teamMemberInput}
                                        onChange={(e) => setTeamMemberInput(e.target.value)}
                                        placeholder="Enter team member name"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                                    />
                                    <Button type="button" onClick={addTeamMember} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {teamMembers.map((member) => (
                                        <Badge key={member} variant="secondary" className="gap-1">
                                            {member}
                                            <button
                                                type="button"
                                                onClick={() => removeTeamMember(member)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                                {createMutation.isPending ? 'Creating...' : 'Create Event'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Events List */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events?.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg sm:text-xl">{event.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            ID: {event.id}
                                        </CardDescription>
                                    </div>
                                    {event.resultsReleased ? (
                                        <Badge className="bg-green-500 flex-shrink-0">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Released
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="flex-shrink-0">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{event.duration} days</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium">Event Period</p>
                                            <p className="text-muted-foreground">
                                                {new Date(event.timePeriod.startDate).toLocaleDateString()} - {new Date(event.timePeriod.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {event.siblingEvent && (
                                    <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                                        <p className="text-sm font-semibold">Sibling Event</p>
                                        <p className="text-sm">{event.siblingEvent.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(event.siblingEvent.timePeriod.startDate).toLocaleDateString()} - {new Date(event.siblingEvent.timePeriod.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-start gap-2 text-sm">
                                    <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Team Members ({event.teamMembers.length})</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {event.teamMembers.map((member) => (
                                                <Badge key={member} variant="outline" className="text-xs">
                                                    {member}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {events && events.length === 0 && !showForm && (
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No events created yet. Click "Create Event" to get started.</p>
                </div>
            )}
        </div>
    );
}
