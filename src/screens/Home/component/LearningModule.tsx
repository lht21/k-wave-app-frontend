import { useNavigation } from "@react-navigation/native"
import { Text, TouchableOpacity, View } from "react-native"


export default function LearningModule(item: {title: string, icon: string, navigateTo?: string}) {
    const navigation = useNavigation<any>()
  return (
    <TouchableOpacity 
        style={styles.moduleItem}
        onPress={() => {
        if (item.navigateTo) {
            switch(item.navigateTo) {
            case 'StdRoadmap':
                navigation.navigate('StdRoadmap')
                break
            case 'StdPracticeExam':
                navigation.navigate('StdPracticeExam')
                break
            case 'StdRealExam':
                navigation.navigate('StdRealExam')
                break
            case 'StdVideoLearning':
                navigation.navigate('StdVideoLearning')
                break
            case 'StdCulture':
                (navigation as any).navigate('StdCulture')
                break
            case 'News':
                // Navigate to News tab
                navigation.jumpTo('News')
                break
            default:
                console.log(`Tính năng ${item.title} đang phát triển`)
            }
        } else {
            console.log(`Tính năng ${item.title} đang phát triển`)
        }
        }}
    >
        <View style={styles.moduleIcon}>
        <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <Text style={styles.moduleTitle}>{item.title}</Text>
    </TouchableOpacity>
  )
    
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    }

})