import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  leads: [],
  isSubmitting: false,
  showLeadForm: false,
  leadFormTriggers: {
    keywords: ['admission', 'apply', 'course', 'fee', 'interested', 'contact', 'brochure'],
    messageCount: 3,
    timeSpent: 30000, // 30 seconds
  },
  analytics: {
    totalLeads: 0,
    leadsToday: 0,
    conversionRate: 0,
    sourceBreakdown: {
      chatbot: 0,
      voice: 0,
      direct: 0,
    },
    statusBreakdown: {
      new: 0,
      contacted: 0,
      qualified: 0,
      enrolled: 0,
    }
  },
  currentLead: null,
  formData: {
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
    source: 'chatbot',
  }
};

// Action types
const LEAD_ACTIONS = {
  SET_SHOW_FORM: 'SET_SHOW_FORM',
  SET_SUBMITTING: 'SET_SUBMITTING',
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  CLEAR_FORM_DATA: 'CLEAR_FORM_DATA',
  ADD_LEAD: 'ADD_LEAD',
  UPDATE_LEAD: 'UPDATE_LEAD',
  DELETE_LEAD: 'DELETE_LEAD',
  SET_CURRENT_LEAD: 'SET_CURRENT_LEAD',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  LOAD_LEADS: 'LOAD_LEADS',
  SET_TRIGGERS: 'SET_TRIGGERS',
};

// Reducer function
const leadReducer = (state, action) => {
  switch (action.type) {
    case LEAD_ACTIONS.SET_SHOW_FORM:
      return {
        ...state,
        showLeadForm: action.payload,
      };

    case LEAD_ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case LEAD_ACTIONS.UPDATE_FORM_DATA:
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case LEAD_ACTIONS.CLEAR_FORM_DATA:
      return {
        ...state,
        formData: {
          name: '',
          email: '',
          phone: '',
          course: '',
          message: '',
          source: 'chatbot',
        },
      };

    case LEAD_ACTIONS.ADD_LEAD:
      const newLead = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        status: 'new',
      };

      const updatedSourceBreakdown = {
        ...state.analytics.sourceBreakdown,
        [newLead.source]: (state.analytics.sourceBreakdown[newLead.source] || 0) + 1,
      };

      const updatedStatusBreakdown = {
        ...state.analytics.statusBreakdown,
        new: state.analytics.statusBreakdown.new + 1,
      };

      return {
        ...state,
        leads: [...state.leads, newLead],
        analytics: {
          ...state.analytics,
          totalLeads: state.analytics.totalLeads + 1,
          leadsToday: state.analytics.leadsToday + 1,
          sourceBreakdown: updatedSourceBreakdown,
          statusBreakdown: updatedStatusBreakdown,
        },
      };

    case LEAD_ACTIONS.UPDATE_LEAD:
      const updatedLeads = state.leads.map(lead =>
        lead.id === action.payload.id
          ? { ...lead, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : lead
      );

      // Update status breakdown if status changed
      let newStatusBreakdown = { ...state.analytics.statusBreakdown };
      if (action.payload.updates.status) {
        const oldLead = state.leads.find(l => l.id === action.payload.id);
        if (oldLead && oldLead.status !== action.payload.updates.status) {
          newStatusBreakdown[oldLead.status] = Math.max(0, newStatusBreakdown[oldLead.status] - 1);
          newStatusBreakdown[action.payload.updates.status] = (newStatusBreakdown[action.payload.updates.status] || 0) + 1;
        }
      }

      return {
        ...state,
        leads: updatedLeads,
        analytics: {
          ...state.analytics,
          statusBreakdown: newStatusBreakdown,
        },
      };

    case LEAD_ACTIONS.DELETE_LEAD:
      const leadToDelete = state.leads.find(l => l.id === action.payload);
      const remainingLeads = state.leads.filter(lead => lead.id !== action.payload);
      
      let deletedStatusBreakdown = { ...state.analytics.statusBreakdown };
      let deletedSourceBreakdown = { ...state.analytics.sourceBreakdown };
      
      if (leadToDelete) {
        deletedStatusBreakdown[leadToDelete.status] = Math.max(0, deletedStatusBreakdown[leadToDelete.status] - 1);
        deletedSourceBreakdown[leadToDelete.source] = Math.max(0, deletedSourceBreakdown[leadToDelete.source] - 1);
      }

      return {
        ...state,
        leads: remainingLeads,
        analytics: {
          ...state.analytics,
          totalLeads: Math.max(0, state.analytics.totalLeads - 1),
          statusBreakdown: deletedStatusBreakdown,
          sourceBreakdown: deletedSourceBreakdown,
        },
      };

    case LEAD_ACTIONS.SET_CURRENT_LEAD:
      return {
        ...state,
        currentLead: action.payload,
      };

    case LEAD_ACTIONS.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };

    case LEAD_ACTIONS.LOAD_LEADS:
      return {
        ...state,
        leads: action.payload,
      };

    case LEAD_ACTIONS.SET_TRIGGERS:
      return {
        ...state,
        leadFormTriggers: { ...state.leadFormTriggers, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const LeadContext = createContext();

// Custom hook to use lead context
export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
};

// Lead provider component
export const LeadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(leadReducer, initialState);

  // Load saved leads on mount
  useEffect(() => {
    try {
      const savedLeads = localStorage.getItem('chatbot_leads');
      if (savedLeads) {
        const parsed = JSON.parse(savedLeads);
        dispatch({ type: LEAD_ACTIONS.LOAD_LEADS, payload: parsed });
        
        // Recalculate analytics
        const analytics = calculateAnalytics(parsed);
        dispatch({ type: LEAD_ACTIONS.UPDATE_ANALYTICS, payload: analytics });
      }
    } catch (error) {
      console.error('Error loading saved leads:', error);
    }
  }, []);

  // Save leads to localStorage whenever leads change
  useEffect(() => {
    try {
      localStorage.setItem('chatbot_leads', JSON.stringify(state.leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }, [state.leads]);

  // Calculate analytics from leads
  const calculateAnalytics = (leads) => {
    const today = new Date().toDateString();
    const leadsToday = leads.filter(lead => 
      new Date(lead.timestamp).toDateString() === today
    ).length;

    const sourceBreakdown = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const conversionRate = leads.length > 0 
      ? ((statusBreakdown.enrolled || 0) / leads.length * 100).toFixed(1)
      : 0;

    return {
      totalLeads: leads.length,
      leadsToday,
      conversionRate: parseFloat(conversionRate),
      sourceBreakdown,
      statusBreakdown,
    };
  };

  // Helper functions
  const showLeadForm = () => {
    dispatch({ type: LEAD_ACTIONS.SET_SHOW_FORM, payload: true });
  };

  const hideLeadForm = () => {
    dispatch({ type: LEAD_ACTIONS.SET_SHOW_FORM, payload: false });
    dispatch({ type: LEAD_ACTIONS.CLEAR_FORM_DATA });
  };

  const updateFormData = (data) => {
    dispatch({ type: LEAD_ACTIONS.UPDATE_FORM_DATA, payload: data });
  };

  const submitLead = async (additionalData = {}) => {
    dispatch({ type: LEAD_ACTIONS.SET_SUBMITTING, payload: true });

    try {
      const leadData = {
        ...state.formData,
        ...additionalData,
      };

      // Validate required fields
      if (!leadData.name || !leadData.email) {
        throw new Error('Name and email are required');
      }

      // Submit to backend
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      const result = await response.json();

      // Add to local state
      dispatch({ type: LEAD_ACTIONS.ADD_LEAD, payload: leadData });
      dispatch({ type: LEAD_ACTIONS.CLEAR_FORM_DATA });
      dispatch({ type: LEAD_ACTIONS.SET_SHOW_FORM, payload: false });

      toast.success('Thank you! We\'ll contact you soon.');
      return result;

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error(error.message || 'Failed to submit lead. Please try again.');
      throw error;
    } finally {
      dispatch({ type: LEAD_ACTIONS.SET_SUBMITTING, payload: false });
    }
  };

  const updateLead = (id, updates) => {
    dispatch({ 
      type: LEAD_ACTIONS.UPDATE_LEAD, 
      payload: { id, updates } 
    });
    toast.success('Lead updated successfully');
  };

  const deleteLead = (id) => {
    dispatch({ type: LEAD_ACTIONS.DELETE_LEAD, payload: id });
    toast.success('Lead deleted successfully');
  };

  const setCurrentLead = (lead) => {
    dispatch({ type: LEAD_ACTIONS.SET_CURRENT_LEAD, payload: lead });
  };

  // Check if lead form should be triggered
  const checkLeadTriggers = (message, messageCount, timeSpent) => {
    const { keywords, messageCount: triggerCount, timeSpent: triggerTime } = state.leadFormTriggers;
    
    // Check keyword triggers
    const hasKeyword = keywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Check message count trigger
    const hasEnoughMessages = messageCount >= triggerCount;

    // Check time spent trigger
    const hasSpentEnoughTime = timeSpent >= triggerTime;

    if ((hasKeyword || hasEnoughMessages || hasSpentEnoughTime) && !state.showLeadForm) {
      showLeadForm();
      return true;
    }

    return false;
  };

  const updateTriggers = (triggers) => {
    dispatch({ type: LEAD_ACTIONS.SET_TRIGGERS, payload: triggers });
  };

  // Get lead statistics
  const getLeadStats = () => {
    return {
      total: state.leads.length,
      today: state.analytics.leadsToday,
      thisWeek: state.leads.filter(lead => {
        const leadDate = new Date(lead.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return leadDate >= weekAgo;
      }).length,
      thisMonth: state.leads.filter(lead => {
        const leadDate = new Date(lead.timestamp);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return leadDate >= monthAgo;
      }).length,
      conversionRate: state.analytics.conversionRate,
      sourceBreakdown: state.analytics.sourceBreakdown,
      statusBreakdown: state.analytics.statusBreakdown,
    };
  };

  const value = {
    // State
    ...state,
    
    // Actions
    showLeadForm,
    hideLeadForm,
    updateFormData,
    submitLead,
    updateLead,
    deleteLead,
    setCurrentLead,
    checkLeadTriggers,
    updateTriggers,
    
    // Helpers
    getLeadStats,
  };

  return (
    <LeadContext.Provider value={value}>
      {children}
    </LeadContext.Provider>
  );
};