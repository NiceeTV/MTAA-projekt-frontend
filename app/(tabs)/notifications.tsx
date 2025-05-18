import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '@/api/client';
import { useTheme } from './themecontext';
import {useOffline} from "@/context/OfflineContext";

/**
 * Komponent pre správu a zobrazenie používateľských notifikácií.
 * 
 * Tento komponent umožňuje:
 * - Zobrazenie zoznamu prijatých notifikácií (žiadosti o priateľstvo, zdieľané výlety)
 * - Spracovanie odpovedí na žiadosti o priateľstvo (prijatie/odmietnutie)
 * - Načítanie údajov o odosielateľoch notifikácií
 * - Prácu v online režime (offline režim nie je podporovaný)
 * 
 * Hlavné funkcie:
 * - Načítanie notifikácií z API
 * - Získavanie používateľských mien odosielateľov
 * - Spracovanie odpovedí na žiadosti o priateľstvo
 * - Automatická aktualizácia zoznamu po akciách používateľa
 * 
 * Štýly:
 * - Prispôsobenie pre dark/light režim
 * - Responzívny dizajn pre rôzne veľkosti obrazoviek
 * - Konzistentné vizuálne prvky v celej aplikácii
 */

type Notification = {
  notification_id: number;
  sender_id: number;
  target_id: number;
  trip_id: number | null;
  created_at: string;
  type: 'trip_share' | 'friend_request';
};

const Notifications = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: number]: string }>({});
  const jeOffline = useOffline();



  useEffect(() => {
    if (!jeOffline) {
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/notifications');
          if (Array.isArray(response)) {
            setNotifications(response);
          } else {
            setNotifications([]);
            console.warn('Očakávalo sa pole, ale odpoveď bola: ', response);
          }
        } catch (error) {
          setError('Chyba pri načítavaní notifikácií');
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchNotifications();
    }
  }, []);

  useEffect(() => {
    if (!jeOffline) {
      const fetchFriendData = async (sender_id: number) => {
        try {
          const response = await api.get(`/users/${sender_id}`);
          if (response.username) {
            setUsernames(prev => ({ ...prev, [sender_id]: response.username }));
          }
        } catch (error) {
          console.error("Error fetching sender's username:", error);
        }
      };

      notifications.forEach(notification => {
        fetchFriendData(notification.sender_id);
      });
    }
  }, [notifications]);

  const themedStyles = getStyles(darkMode);

  const handleAccept = async (notificationId: number, senderId: number) => {
  try {
    await api.put('/friendshipResponse', {
      sender_id: senderId,
      action: 'accept',
    });

    // Odstráň notifikáciu zo zoznamu
    setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
  } catch (error) {
    console.error('Chyba pri prijímaní žiadosti o priateľstvo:', error);
  }
};

const handleReject = async (notificationId: number, senderId: number) => {
  try {
    await api.put('/friendshipResponse', {
      sender_id: senderId,
      action: 'decline',
    });

    // Remove notification from the list
    setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
  } catch (error: unknown) {
    console.error('Chyba pri odmietnutí žiadosti o priateľstvo:', error);
    
    // Type-guard to check if it's an instance of Error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};




  const renderNotification = ({ item }: { item: Notification }) => {
    const username = usernames[item.sender_id];
    let notificationText = '';

    switch (item.type) {
      case 'friend_request':
        notificationText = `Máte žiadosť o priateľstvo od používateľa ${username || 'Neznámy'}`;
        break;
      case 'trip_share':
        notificationText = `Používateľ ${username || 'Neznámy'} zdieľal výzvu na cestu`;
        break;
      default:
        notificationText = 'Neznáma notifikácia';
    }

    return (
      <View style={themedStyles.notificationContainer}>
        <Text style={themedStyles.notificationTitle}>Notifikácia od používateľa {username}</Text>
        <Text style={themedStyles.notificationBody}>{notificationText}</Text>
        <Text style={themedStyles.notificationDate}>{new Date(item.created_at).toLocaleString()}</Text>

        {item.type === 'friend_request' && (
          <View style={themedStyles.buttonRow}>
           <TouchableOpacity
  style={[themedStyles.button, themedStyles.acceptButton]}
  onPress={() => handleAccept(item.notification_id, item.sender_id)}
>
  <Text style={themedStyles.buttonText}>Prijať</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[themedStyles.button, themedStyles.rejectButton]}
  onPress={() => handleReject(item.notification_id, item.sender_id)}
>
  <Text style={themedStyles.buttonText}>Odmietnuť</Text>
</TouchableOpacity>

          </View>
        )}
      </View>
    );
  };

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

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>Notifikácie</Text>
      {notifications.length === 0 || jeOffline ? (
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
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    acceptButton: {
      backgroundColor: '#4CAF50',
    },
    rejectButton: {
      backgroundColor: '#F44336',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
  });

export default Notifications;
