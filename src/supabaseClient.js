import { createClient } from '@supabase/supabase-js';
import { MOCK_COURSES, MOCK_COLLEGES, MOCK_QUESTIONS, MOCK_COLLEGE_COURSES } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

let client;
const isLiveSupabase = supabaseUrl && supabaseAnonKey;

if (isLiveSupabase) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // ==========================================
  // SIMULATED SUPABASE MOCK CLIENT (LOCAL)
  // ==========================================
  
  const authListeners = new Set();

  const getSessionUser = () => {
    const session = localStorage.getItem('mock_session');
    return session ? JSON.parse(session) : null;
  };

  const triggerAuthChange = (event, session) => {
    authListeners.forEach(cb => cb(event, session));
  };

  // Prepopulate static tables if not already present
  if (!localStorage.getItem('mock_courses')) {
    localStorage.setItem('mock_courses', JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem('mock_colleges')) {
    localStorage.setItem('mock_colleges', JSON.stringify(MOCK_COLLEGES));
  }
  if (!localStorage.getItem('mock_college_courses')) {
    localStorage.setItem('mock_college_courses', JSON.stringify(MOCK_COLLEGE_COURSES));
  }

  // Pre-seed default administrator credentials
  const defaultAdminId = "00000000-0000-0000-0000-000000000000";
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([
      { id: defaultAdminId, email: "havathcareerhelps@gmail.com", password: "Admin@careerhelpsweb" }
    ]));
  }
  if (!localStorage.getItem('mock_profiles')) {
    localStorage.setItem('mock_profiles', JSON.stringify([
      {
        id: defaultAdminId,
        name: "Havath (Admin)",
        email: "havathcareerhelps@gmail.com",
        phone: "",
        state: "",
        city: "",
        education_level: "",
        board: "",
        marks_10th: null,
        marks_12th: null,
        course_preferred: "",
        budget: null,
        learning_mode: "",
        preferred_location: "",
        consent_given: true,
        is_admin: true,
        created_at: new Date().toISOString()
      }
    ]));
  }

  const executeMockQuery = async (state) => {
    // Delay slightly to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    let profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]');
    let user_responses = JSON.parse(localStorage.getItem('mock_user_responses') || '[]');
    let applications = JSON.parse(localStorage.getItem('mock_applications') || '[]');
    let courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    let colleges = JSON.parse(localStorage.getItem('mock_colleges') || '[]');
    let college_courses = JSON.parse(localStorage.getItem('mock_college_courses') || '[]');

    let tableData = [];
    if (state.table === 'profiles') tableData = profiles;
    else if (state.table === 'user_responses') tableData = user_responses;
    else if (state.table === 'applications') tableData = applications;
    else if (state.table === 'courses') tableData = courses;
    else if (state.table === 'colleges') tableData = colleges;
    else if (state.table === 'college_courses') tableData = college_courses;

    if (state.method === 'select') {
      let filtered = [...tableData];
      for (const f of state.filters) {
        filtered = filtered.filter(row => row[f.field] == f.value);
      }

      // Resolve joins for applications table
      if (state.table === 'applications') {
        filtered = filtered.map(app => {
          const college = colleges.find(c => c.id == app.college_id);
          const course = courses.find(c => c.id == app.course_id);
          return {
            ...app,
            colleges: college || null,
            courses: course || null
          };
        });
      }

      if (state.isSingle) {
        return { data: filtered[0] || null, error: null };
      }
      return { data: filtered, error: null };
    }

    if (state.method === 'insert' || state.method === 'upsert') {
      const toInsert = Array.isArray(state.dataToInsert) ? state.dataToInsert : [state.dataToInsert];
      const newRecords = toInsert.map(item => {
        let base = { ...item };
        if (!base.id) {
          base.id = state.table === 'applications' ? crypto.randomUUID() : Math.floor(Math.random() * 1000000);
        }
        if (state.table === 'applications' && !base.applied_on) {
          base.applied_on = new Date().toISOString();
        }
        return base;
      });

      if (state.table === 'profiles') {
        profiles = [...profiles, ...newRecords];
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));
      } else if (state.table === 'user_responses') {
        for (const rec of newRecords) {
          const index = user_responses.findIndex(r => r.user_id === rec.user_id && r.question_id === rec.question_id);
          if (index > -1) user_responses[index] = rec;
          else user_responses.push(rec);
        }
        localStorage.setItem('mock_user_responses', JSON.stringify(user_responses));
      } else if (state.table === 'applications') {
        for (const rec of newRecords) {
          const index = applications.findIndex(r => r.user_id === rec.user_id && r.college_id === rec.college_id && r.course_id === rec.course_id);
          if (index > -1) applications[index] = rec;
          else applications.push(rec);
        }
        localStorage.setItem('mock_applications', JSON.stringify(applications));
      } else if (state.table === 'courses') {
        courses = [...courses, ...newRecords];
        localStorage.setItem('mock_courses', JSON.stringify(courses));
      } else if (state.table === 'colleges') {
        colleges = [...colleges, ...newRecords];
        localStorage.setItem('mock_colleges', JSON.stringify(colleges));
      } else if (state.table === 'college_courses') {
        for (const rec of newRecords) {
          const index = college_courses.findIndex(r => r.college_id === rec.college_id && r.course_id === rec.course_id);
          if (index > -1) college_courses[index] = rec;
          else college_courses.push(rec);
        }
        localStorage.setItem('mock_college_courses', JSON.stringify(college_courses));
      }

      return { data: newRecords, error: null };
    }

    if (state.method === 'update') {
      let updatedRows = [];
      let updatedTable = tableData.map(row => {
        let match = true;
        for (const f of state.filters) {
          if (row[f.field] != f.value) match = false;
        }
        if (match) {
          const updated = { ...row, ...state.dataToUpdate };
          updatedRows.push(updated);
          return updated;
        }
        return row;
      });

      if (state.table === 'profiles') {
        localStorage.setItem('mock_profiles', JSON.stringify(updatedTable));
      } else if (state.table === 'user_responses') {
        localStorage.setItem('mock_user_responses', JSON.stringify(updatedTable));
      } else if (state.table === 'applications') {
        localStorage.setItem('mock_applications', JSON.stringify(updatedTable));
      } else if (state.table === 'courses') {
        localStorage.setItem('mock_courses', JSON.stringify(updatedTable));
      } else if (state.table === 'colleges') {
        localStorage.setItem('mock_colleges', JSON.stringify(updatedTable));
      }

      return { data: updatedRows, error: null };
    }

    return { data: null, error: 'Unknown query method' };
  };

  const makeQueryChain = (table) => {
    let queryState = {
      table,
      method: 'select',
      dataToInsert: null,
      dataToUpdate: null,
      filters: [],
      isSingle: false
    };

    const chain = {
      select(fields = '*') {
        queryState.method = 'select';
        return this;
      },
      insert(data) {
        queryState.method = 'insert';
        queryState.dataToInsert = data;
        return this;
      },
      update(data) {
        queryState.method = 'update';
        queryState.dataToUpdate = data;
        return this;
      },
      upsert(data) {
        queryState.method = 'upsert';
        queryState.dataToInsert = data;
        return this;
      },
      eq(field, value) {
        queryState.filters.push({ field, value });
        return this;
      },
      single() {
        queryState.isSingle = true;
        return this;
      },
      async then(onfulfilled, onrejected) {
        try {
          const result = await executeMockQuery(queryState);
          return onfulfilled ? onfulfilled(result) : result;
        } catch (err) {
          if (onrejected) return onrejected(err);
          throw err;
        }
      }
    };
    return chain;
  };

  client = {
    auth: {
      async signUp({ email, password, options = {} }) {
        await new Promise(resolve => setTimeout(resolve, 300));
        let users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.find(u => u.email === email)) {
          return { data: null, error: { message: 'User already exists' } };
        }
        
        const newUserId = crypto.randomUUID();
        const newUser = { id: newUserId, email, password };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));

        // Create Profile row
        let profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]');
        const userMetaData = options.data || {};
        const isFirstUser = users.length === 1; // First registered mock user can be default admin for convenience
        const newProfile = {
          id: newUserId,
          name: userMetaData.name || 'Student',
          email: email,
          phone: '',
          state: '',
          city: '',
          education_level: '',
          board: '',
          marks_10th: null,
          marks_12th: null,
          course_preferred: '',
          budget: null,
          learning_mode: '',
          preferred_location: '',
          consent_given: userMetaData.consent_given || false,
          is_admin: userMetaData.is_admin || isFirstUser, // Auto-make first user admin for QA testing
          created_at: new Date().toISOString()
        };
        profiles.push(newProfile);
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));

        const session = {
          user: { id: newUserId, email, user_metadata: { name: newProfile.name, is_admin: newProfile.is_admin } },
          access_token: 'mock_token'
        };

        localStorage.setItem('mock_session', JSON.stringify(session));
        triggerAuthChange('SIGNED_IN', session);
        return { data: session, error: null };
      },

      async signInWithPassword({ email, password }) {
        await new Promise(resolve => setTimeout(resolve, 300));
        let users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          return { data: null, error: { message: 'Invalid login credentials' } };
        }

        let profiles = JSON.parse(localStorage.getItem('mock_profiles') || '[]');
        const profile = profiles.find(p => p.id === user.id);

        const session = {
          user: { id: user.id, email, user_metadata: { name: profile ? profile.name : 'Student', is_admin: profile ? profile.is_admin : false } },
          access_token: 'mock_token'
        };

        localStorage.setItem('mock_session', JSON.stringify(session));
        triggerAuthChange('SIGNED_IN', session);
        return { data: session, error: null };
      },

      async signOut() {
        await new Promise(resolve => setTimeout(resolve, 150));
        localStorage.removeItem('mock_session');
        triggerAuthChange('SIGNED_OUT', null);
        return { error: null };
      },

      async getSession() {
        const s = localStorage.getItem('mock_session');
        return { data: { session: s ? JSON.parse(s) : null }, error: null };
      },

      onAuthStateChange(callback) {
        authListeners.add(callback);
        // Fire immediately with current session
        const s = localStorage.getItem('mock_session');
        const session = s ? JSON.parse(s) : null;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);

        return {
          data: {
            subscription: {
              unsubscribe() {
                authListeners.delete(callback);
              }
            }
          }
        };
      }
    },

    from(table) {
      return makeQueryChain(table);
    }
  };
}

export const supabase = client;
export const isMocked = !isLiveSupabase;
