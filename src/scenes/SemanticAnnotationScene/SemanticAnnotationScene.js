import React, { Component } from 'react';
import { connect } from 'react-redux';
import { style, colors } from '@style/main';
import privateStyle from './style';
import { View, Text, TextInput, Button } from 'react-native';
import { ZButton, ZRichTextEditor } from '@components';
import { createSemanticAnnotation, fetchSemanticBodies } from '@actions';
import ModalDropdown from 'react-native-modal-dropdown';
import {
  BallIndicator,
  BarIndicator,
  DotIndicator,
  MaterialIndicator,
  PacmanIndicator,
  PulseIndicator,
  SkypeIndicator,
  UIActivityIndicator,
  WaveIndicator
} from 'react-native-indicators';


let textContentPats = [];
let annotations = [];
let startIndex = 0;



export class SemanticAnnotationScene extends Component {

    constructor(props) {
      
      super(props);

      this.state = {
        textVal: `Raskolnikov is the protagonist of the novel, and the story is told almost exclusively from his point Berlin of view. His name derives from the Russian word raskolnik, meaning “schismatic” or “divided,” which is appropriate since his most fundamental character trait is his alienation from human society.`,
        startIndex: -1,
        endIndex: -1,
        selectedText: '',
        isFocused: true,
        isSpinnerShown: false
      };
    }

    componentWillMount(nextProps) {

      if(this.props.isSuccessfull === false && this.nextProps.isSuccessfull === true)
        this.props.navigation.goBack();
    }

    confirmTextSelection() {

      if(this.state.isFocused == true) {

        this.setState({ isSpinnerShown: true });

        let selectedText = this.state.textVal.substring(this.state.startIndex, this.state.endIndex);

        if(selectedText != '') {

          this.highlightText(this.state.startIndex, this.state.endIndex);
          this.setState({ 
            isFocused: false,
            selectedText: selectedText
          });

          this.props.fetchSemanticBodies(selectedText);
        }
      }
    }

    handleDropdownSelection(index, value) {

      if(index != -1 && index <= this.props.semanticBodyData.semanticBodies.results.bindings.length) {

        let selectedBody = this.props.semanticBodyData.semanticBodies.results.bindings[index]
      }
    }

    handleTextSelection(event) {

      this.setState({
        startIndex: event.nativeEvent.selection.start,
        endIndex: event.nativeEvent.selection.end
      })
    }

    highlightText(startIndex, endIndex) {

        if(this.state.textVal != null && this.state.textVal != '') {
          
          annotations = [];
          annotations.push({start: startIndex, end: endIndex});
        }
    }

    createHiglightedText() {

      textContentPats = [];
      startIndex = 0;

      annotations.forEach((annotation, counter) => {

        let preText = "";
        let annotationText = "";

        if(annotation.start != 0)
          preText = this.state.textVal.substring(startIndex, annotation.start);

        annotationText = this.state.textVal.substring(annotation.start, annotation.end);

        if(preText != "")
          textContentPats.push({isAnnotation: false, text: preText});

        if(annotationText != "") {
          textContentPats.push({isAnnotation: true, text: annotationText})
        }

        startIndex = annotation.end;

        if(counter == annotations.length - 1)
          textContentPats.push({isAnnotation: false, text: this.state.textVal.substring(annotation.end, this.state.textVal.length)})
      });

      return textContentPats;
    }

    createAnnotation() {


    }

    render(){

      const { navigate } = this.props.navigation;
      let semanticBodies = this.props.semanticBodyData.semanticBodies.results != null
        ? this.props.semanticBodyData.semanticBodies.results.bindings.map(i => (i.name.value + '  (' + i.type.value + ')'))
        : [];

    	return(
        <View style={[style.zPage]}>

          {
            this.state.isSpinnerShown &&
            <View style={style.spinnerContainer}>
              <BallIndicator color={colors.spinnerColor} animationDuration={800} style={style.spinner} />
              <View style={style.spinnerDarkLayer}></View> 
            </View> 
          }

          <View style={privateStyle.pageContainer}>
              

            <View style={privateStyle.contentContainer}>
             {
                this.state.isFocused 
                ?
                <TextInput
                    onPress={()=> { this.setState({ isFocused: false })}}
                    style={privateStyle.contentPresenter}
                    multiline={true}
                    autoFocus={true}
                    editable={false}
                    value={this.state.textVal}
                    onSelectionChange={(event) => this.handleTextSelection(event)}/>
                :
                <Text style={[privateStyle.contentPresenter, privateStyle.contentView]}
                      onPress={()=> { this.setState({ isFocused: true })}}>
                      {
                        this.createHiglightedText().map((item, key) => {
                          return (
                            item.isAnnotation 
                            ? 
                            <Text key={key} 
                              style={{ backgroundColor: 'yellow' }}>
                                {item.text}
                              </Text> 
                              : 
                              <Text key={key}>
                                  {item.text}
                              </Text>
                          );
                      })}
                </Text>
              }
            </View>


            <View style={privateStyle.editorContainer}>

              <Button title="Select Text"
                style={privateStyle.textSelector}
                onPress={() => this.confirmTextSelection()}/>

              <ModalDropdown options={semanticBodies}
                defaultValue="Please select body..."
                showsVerticalScrollIndicator={true}
                style={privateStyle.dropdown}
                textStyle={privateStyle.dropdownText}
                dropdownStyle={privateStyle.dropdownBody}
                dropdownTextStyle={privateStyle.dropdownTextStyle}
                onSelect={(idx, value) => this.handleDropdownSelection(idx, value)}/>
            </View>

            <View style={privateStyle.footer}>
              <ZButton text="Annotate"
                  onPress={() => this.createAnnotation()}/>
            </View>

          </View>
        </View>
		  )
    }

}

function mapStateToProps (state) {
  return {
    semanticBodyData: state.SemanticBodiesReducer,
    annotationData: state.SemanticAnnotationReducer
  }
}

function mapDispatchToProps (dispatch) {
  return {
    createSemanticAnnotation: (annotation) => dispatch(createSemanticAnnotation(annotation)),
    fetchSemanticBodies: (keyword) => dispatch(fetchSemanticBodies(keyword))
  }
}

export default connect( mapStateToProps, mapDispatchToProps)(SemanticAnnotationScene);