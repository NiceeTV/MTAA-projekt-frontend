import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api } from '@/api/client';
import { useTheme } from './themecontext';

// Definícia typu pre notifikáciu
type Notification = {
  notification_id: number;
  sender_id: number;
  target_id: number;
  trip_id: number | null;
  created_at: string;
  type: 'trip_share' | 'friend_request'; // Typy notifikácií
};

const Notifications = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]); // Typ pre state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        setError('Chyba pri načítavaní notifikácií');
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const themedStyles = getStyles(darkMode);

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={darkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={themedStyles.errorContainer}>
        <Text style={themedStyles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderNotification = ({ item }: { item: Notification }) => {
    let notificationText = '';

    // Zobrazenie rôznych typov notifikácií
    switch (item.type) {
      case 'friend_request':
        notificationText = `Máte žiadosť o priateľstvo od používateľa ${item.sender_id}`;
        break;
      case 'trip_share':
        notificationText = `Používateľ ${item.sender_id} zdieľal výzvu na cestu`;
        break;
      default:
        notificationText = 'Neznáma notifikácia';
    }

    return (
      <View style={themedStyles.notificationContainer}>
        <Text style={themedStyles.notificationTitle}>Notifikácia od používateľa {item.sender_id}</Text>
        <Text style={themedStyles.notificationBody}>{notificationText}</Text>
        <Text style={themedStyles.notificationDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>Notifikácie</Text>
      {notifications.length === 0 ? (
        <Text style={themedStyles.noNotificationsText}>Tento používateľ nemá žiadne notifikácie.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notification_id.toString()}
          renderItem={renderNotification}
        />
      )}
    </View>
  );
};

const getStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#1a1a1a' : '#fff',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: dark ? '#fff' : '#000',
      marginBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 18,
    },
    noNotificationsText: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',
      textAlign: 'center',
    },
    notificationContainer: {
      backgroundColor: dark ? '#333' : '#f4f4f4',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: dark ? '#fff' : '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    notificationTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: dark ? '#fff' : '#000',
    },
    notificationBody: {
      fontSize: 14,
      color: dark ? '#ccc' : '#333',
      marginVertical: 5,
    },
    notificationDate: {
      fontSize: 12,
      color: dark ? '#bbb' : '#666',
      marginTop: 5,
    },
  });

export default Notifications;
